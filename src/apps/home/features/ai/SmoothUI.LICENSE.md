# SmoothUI attribution

`SmoothMatrixButton.tsx` and `smoothMatrixButton.css` adapt the official
[SmoothButton registry component](https://smoothui.dev/r/smooth-button.json)
from [SmoothUI](https://github.com/educlopez/smoothui) by Eduardo Calvo.
Source consulted on 2026-09-10.

The outline variant, pill shape, inline layout, 150 ms interaction transitions,
0.97 active scale, keyboard focus treatment and reduced-motion behavior are
translated from the upstream component into local React and plain CSS. The
unneeded variant builder, slot dependency, loading indicator and Safari force
press are omitted. The matrix scan and adjusted dimensional shadows are custom
portfolio additions.

## Upstream license

MIT License

Copyright (c) 2024 Eduardo Calvo

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
