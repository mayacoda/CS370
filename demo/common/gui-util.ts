export function createElement(className: string, elementTag: string = 'div') {
    const element = document.createElement(elementTag);
    element.classList.add(className);
    return element;
}
