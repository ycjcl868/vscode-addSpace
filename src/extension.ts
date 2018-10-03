import * as vscode from 'vscode';
import * as pangu from 'pangu';

export function activate(context: vscode.ExtensionContext) {
	console.log("Congratulations, your extension'addSpace'is now active!");
	const addSpace = new AddSpace();
	var add_space = vscode.commands.registerCommand('extension.add_space', addSpace.addSpaceSelection);
	var add_space_all = vscode.commands.registerCommand('extension.add_space_all', addSpace.addSpaceAll);

	const _onSaveDisposable = vscode.workspace.onWillSaveTextDocument(addSpace.onWillSaveDoc);

	context.subscriptions.push(add_space);
	context.subscriptions.push(add_space_all);
	context.subscriptions.push(addSpace);
	context.subscriptions.push(_onSaveDisposable);
}

// 定义一个 space 类型接口
interface ISpace {
	e: vscode.TextEditor;
	d: vscode.TextDocument;
	sel: vscode.Selection[];
}

class AddSpace {
	private _disposable: vscode.Disposable;
	private _settings: vscode.WorkspaceConfiguration;
	constructor() {
		this._settings = vscode.workspace.getConfiguration('addSpace');
				// 当 settings.json 用户配置中有 addSpace.auto_space_on_save 为 ture
		let subscriptions: vscode.Disposable[] = [];
		vscode.workspace.onDidChangeConfiguration(change => {
			// 重新获取一次
			this._settings = vscode.workspace.getConfiguration('addSpace');
		});
		this._disposable = vscode.Disposable.from(...subscriptions);
	}

	private _addSpace = (space: ISpace): void => {
		const { e, d, sel } = space;
		e.edit(function (edit) {
			// 依次循环转换
			for (var x = 0; x < sel.length; x++) {
					let txt: string = d.getText(new vscode.Range(sel[x].start, sel[x].end));
					edit.replace(sel[x], pangu.spacing(txt));
			}
		});
	}
	// 给特定选区加空格
	public addSpaceSelection = (): void => {
		let e = vscode.window.activeTextEditor;
		let d = e.document;
		let sels = e.selections;
		const space: ISpace = {
			e,
			d,
			sel: sels,
		}
		this._addSpace(space);
	}
	// 全部加空格
	public addSpaceAll = (): void => {
		let e = vscode.window.activeTextEditor;
		let d = e.document;
		let sel = new vscode.Selection(new vscode.Position(0, 0), new vscode.Position(Number.MAX_VALUE, Number.MAX_VALUE));
		const space: ISpace = {
			e,
			d,
			sel: [sel],
		}
		this._addSpace(space);
	}
	// 保存的时候，触发
	public onWillSaveDoc = (): void => {
		if (this._settings.get('auto_space_on_save')) {
			this.addSpaceAll();
		}
	}
	dispose() {
		this._disposable.dispose();
	}
}

export function deactivate() {}
