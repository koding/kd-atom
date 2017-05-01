'use babel'
/* globals atom */

const CMD_TREE_VIEW_SHOW = 'tree-view:show'

export default function showTreeView() {
  const activeEditor = atom.workspace.getActiveTextEditor()
  const activeView = atom.views.getView(activeEditor)

  try {
    atom.commands.dispatch(activeView, CMD_TREE_VIEW_SHOW)
  } catch (_) {} // no tree view package is installed.
}
