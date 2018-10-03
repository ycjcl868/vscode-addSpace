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

interface ISpace {
	e: vscode.TextEditor;
	d: vscode.TextDocument;
	sel: vscode.Selection[];
}

class AddSpace {
	private _disposable: vscode.Disposable;
	constructor() {
		const settings: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration('addSpace');
		if (settings.get('auto_space_on_save')) {
				let subscriptions: vscode.Disposable[] = [];
				this._disposable = vscode.Disposable.from(...subscriptions);
		}
	}

	private _addSpace = (space: ISpace): void => {
		const { e, d, sel } = space;
		e.edit(function (edit) {
			// itterate through the selections and convert all text to Lower
			for (var x = 0; x < sel.length; x++) {
					let txt: string = d.getText(new vscode.Range(sel[x].start, sel[x].end));
					edit.replace(sel[x], pangu.spacing(txt));
			}
		});
	}
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

	public onWillSaveDoc = (): void => {
		this.addSpaceAll();
	}
	dispose() {
		this._disposable.dispose();
	}
}

export function deactivate() {}
