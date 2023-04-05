export function isEmptyString(text?: string): boolean {
    return (
        text === null ||
        text === undefined ||
        text.trim() === '' ||
        text.length === 0
    );
}
