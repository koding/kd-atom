'use babel'

import debug from 'debug'
import { Emitter, TextEditor } from 'atom'
import { View } from 'atom-space-pen-views'

const log = debug('mount-prompt:log')

/* taken from github.com/atom/settings-view/blob/master/lib/settings-panel.js
   adjsuted slightly */
const elementForEditor = prompt => {
  let { placeholder, title, name, description } = prompt

  const fragment = document.createDocumentFragment()

  const label = document.createElement('label')
  label.classList.add('control-label')

  const titleDiv = document.createElement('div')
  titleDiv.classList.add('setting-title')
  titleDiv.textContent = title
  label.appendChild(titleDiv)

  if (description) {
    const descriptionDiv = document.createElement('div')
    descriptionDiv.classList.add('setting-description')
    descriptionDiv.innerHTML = description
    label.appendChild(descriptionDiv)
  }
  fragment.appendChild(label)

  const controls = document.createElement('div')
  controls.classList.add('controls')

  const editorContainer = document.createElement('div')
  editorContainer.classList.add('editor-container')

  const editor = new TextEditor({ mini: true, placeholderText: placeholder })
  editor.element.id = name
  editor.element.setAttribute('type', 'string')
  editorContainer.appendChild(editor.element)
  controls.appendChild(editorContainer)
  fragment.appendChild(controls)

  return [fragment, editor]
}

export default class PromptView extends View {
  static content({ prompts, callback }) {
    log(prompts, callback)
    this.div({ class: 'kd-prompt-view' }, () => {
      this.div({ outlet: 'prompts' })
      this.button(
        {
          click: 'cancel',
          class: 'btn cancel',
          type: 'button',
        },
        'CANCEL'
      )
      this.button(
        {
          click: 'submit',
          class: 'btn btn-info pull-right submit',
          type: 'submit',
        },
        'MOUNT'
      )
    })
  }

  initialize({ prompts, callback }) {
    log(callback)
    this.callback = callback
    this.editors = {}
    this.emitter = new Emitter()
    prompts.forEach(prompt => {
      let [fragment, editor] = elementForEditor.call(this, prompt)
      this.editors[prompt.name] = editor
      editor.setText(prompt.defaultValue)
      this.prompts[0].appendChild(fragment)
    })
  }

  submit() {
    let values = {}
    for (let name in this.editors) {
      let editor = this.editors[name]
      values[name] = editor.getText()
    }
    this.callback(null, values)
  }

  cancel() {
    this.callback(true)
  }
}
