# translate-ext

An experimental firefox extension which translates selected text on a web page from English to Chinese and vice-versa.  
The translation is done by simply request an URI which is analyzed from Bing translation APP, it only supports word or simple phrase level translation.  

## Usage

### Load extension temporarily

To load this extension, open firefox, type and goto `about:debugging#/runtime/this-firefox` in omnibox, click "Load Temporary Add-on", then select any file in this extension's directory.

### Translate selected text

To use this extension, select a text(word or short phrases) on a web page, right click to open context menu the choose "Translate me", a sticky note with translation result will be shown.  
You can move the note by dragging it. Click the 'x' button on the left top of the note to close it.

## TODO

- [ ] Add configurations
  - [ ] history
    - [ ] `option` permanent
    - [ ] `spinner` count, max count
- [ ] Find better translation API
- [ ] Keep sticky note size fixed
- [ ] Scrollable content
