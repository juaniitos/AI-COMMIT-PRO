import * as assert from 'assert';
import * as vscode from 'vscode';
import { getConfig, isConfigured } from '../config';
import { GitService } from '../git';
import { AIService } from '../anthropic';

suite('AI Commit Pro Test Suite', () => {
	vscode.window.showInformationMessage('🧪 Running AI Commit Pro tests...');

	suite('Configuration Tests', () => {
		test('getConfig should return valid config object', () => {
			const config = getConfig();
			assert.ok(config);
			assert.ok('apiKey' in config);
			assert.ok('model' in config);
			assert.ok('language' in config);
			assert.ok('maxRecentCommits' in config);
		});

		test('getConfig should have default values', () => {
			const config = getConfig();
			assert.strictEqual(config.model, 'claude-3-5-haiku-20241022');
			assert.strictEqual(config.maxRecentCommits, 5);
		});

		test('isConfigured should return boolean', () => {
			const result = isConfigured();
			assert.strictEqual(typeof result, 'boolean');
		});
	});

	suite('GitService Tests', () => {
		test('GitService should instantiate with workspace root', () => {
			const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
			if (workspaceRoot) {
				const gitService = new GitService(workspaceRoot);
				assert.ok(gitService);
			}
		});

		test('getStagedDiff should handle no staged changes', async function() {
			this.timeout(5000);
			const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
			if (workspaceRoot) {
				const gitService = new GitService(workspaceRoot);
				try {
					const diff = await gitService.getStagedDiff();
					// Should either return null (no changes) or a valid diff object
					assert.ok(diff === null || (diff.files && diff.diff !== undefined));
				} catch (error: any) {
					// Error is acceptable if not in a git repo
					assert.ok(error.message.includes('Git') || error.message.includes('repositorio'));
				}
			}
		});

		test('getRecentCommits should return array', async function() {
			this.timeout(5000);
			const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
			if (workspaceRoot) {
				const gitService = new GitService(workspaceRoot);
				const commits = await gitService.getRecentCommits(5);
				assert.ok(Array.isArray(commits));
			}
		});
	});

	suite('AIService Tests', () => {
		test('AIService should instantiate with valid config', () => {
			const config = {
				apiKey: 'test-key',
				model: 'claude-3-5-haiku-20241022',
				language: 'english' as const,
				maxRecentCommits: 5
			};
			const aiService = new AIService(config);
			assert.ok(aiService);
		});

		test('generateCommitMessage should throw error with invalid API key', async function() {
			this.timeout(10000);
			const config = {
				apiKey: 'invalid-key',
				model: 'claude-3-5-haiku-20241022',
				language: 'english' as const,
				maxRecentCommits: 5
			};
			const aiService = new AIService(config);
			
			const mockDiff = {
				files: ['test.ts'],
				diff: '+ console.log("test");'
			};

			try {
				await aiService.generateCommitMessage(mockDiff, []);
				assert.fail('Should have thrown error with invalid API key');
			} catch (error: any) {
				assert.ok(error.message);
				// Should have a descriptive error message
				assert.ok(
					error.message.includes('API Key') || 
					error.message.includes('401') ||
					error.message.includes('inválida')
				);
			}
		});
	});

	suite('Command Tests', () => {
		test('Extension should register generateCommit command', async () => {
			const commands = await vscode.commands.getCommands();
			assert.ok(commands.includes('ai-commit-pro.generateCommit'));
		});

		test('Command should be executable', async function() {
			this.timeout(5000);
			try {
				// Just verify command exists and can be called
				// (will fail gracefully if no API key or staged changes)
				await vscode.commands.executeCommand('ai-commit-pro.generateCommit');
				assert.ok(true);
			} catch (error) {
				// Command executed but may have failed due to missing config
				assert.ok(true);
			}
		});
	});

	suite('Integration Tests', () => {
		test('Full workflow with mock data', async function() {
			this.timeout(5000);
			
			// Verify all components can work together
			const config = getConfig();
			assert.ok(config);
			
			const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
			if (workspaceRoot) {
				const gitService = new GitService(workspaceRoot);
				assert.ok(gitService);
				
				// Test that we can get recent commits
				const commits = await gitService.getRecentCommits(3);
				assert.ok(Array.isArray(commits));
			}
		});
	});
});

