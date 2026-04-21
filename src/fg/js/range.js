function rangeFromPoint(point) {
    if (!document.caretRangeFromPoint) {
        document.caretRangeFromPoint = (x, y) => {
            const position = document.caretPositionFromPoint(x,y);
            if (position && position.offsetNode && position.offsetNode.nodeType === Node.TEXT_NODE) {
                const range = document.createRange();
                range.setStart(position.offsetNode, position.offset);
                range.setEnd(position.offsetNode, position.offset);
                return range;
            }
            return null;
        };
    }

    return document.caretRangeFromPoint(point.x, point.y);
}

class TextSourceRange {
    constructor(range) {
        this.rng = range;
    }

    text() {
        return this.rng.toString();
    }

    setWordRange() {
        let backwardcount = 1;
        let forwardcount = 1;
        if (this.rng.startContainer.data) {
            this.setStartOffset(backwardcount);
            this.setEndOffset(forwardcount);
        }
        return null;
    }

    isAlpha(char) {
        return /[\u002D\u0041-\u005A\u0061-\u007A\u00A0-\u024F]/.test(char);
    }

    getStartPos(backwardcount) {
        let pos = this.rng.startOffset;
        let count = 0;
        let text = this.rng.startContainer.data;

        while (pos > 0) {
            let char = text.charAt(pos - 1);
            if (!this.isAlpha(char)) {
                count++;
                if (count == backwardcount) {
                    break;
                }
            }
            pos--;
        }
        return pos;
    }

    getEndPos(forwardcount) {
        let pos = this.rng.endOffset;
        let count = 0;
        let text = this.rng.endContainer.data;

        while (pos < text.length) {
            let char = text.charAt(pos);
            if (!this.isAlpha(char)) {
                count++;
                if (count == forwardcount) {
                    break;
                }
            }
            pos++;
        }
        return pos;
    }

    setStartOffset(backwardcount) {
        let startPos = this.getStartPos(backwardcount);
        this.rng.setStart(this.rng.startContainer, startPos);
    }

    setEndOffset(forwardcount) {
        let endPos = this.getEndPos(forwardcount);
        this.rng.setEnd(this.rng.endContainer, endPos);
    }

    selectText() {
        this.setWordRange();
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(this.rng);
    }

    deselect() {
        const selection = window.getSelection();
        selection.removeAllRanges();
    }
}