<a name="module_Highlight"></a>

## Highlight
A custom Quill highlighting module.  It manages multiple mode instances
that are used to apply text formatting to the contents of the control.

The module is added to the component per the API instructions:
https://quilljs.com/guides/building-a-custom-module/

Once the module is initialized the highlighting mode can be changed with
the `set` function.  This just changes what the reference internally to
another class that handles the formatting.

#### Examples:

```javascript
import {EditorMode, EditorStyle, Highlight} from './modules';

Quill.register('modules/highlight', Highlight);
const quill = new Quill('#editor', {
    formats: '',
    modules: {
        highlight: {
        }
    },
    theme: 'snow'
});
...
const highlight = quill.getModule('highlight');
highlight.set({
    content: 'some value',
    mode: EditorMode.markdown,
    styling: EditorStyle.monokai
});
```

