/**
 * createFor's per-item renderFn and createIf's per-branch renderTrue/
 * renderFalse both have the same contract: return exactly one Node, which
 * the caller tracks for later removal/replacement (createFor keys it per
 * item; createIf holds onto it as `currentNode`). But a `<for>` or `<if>`
 * body isn't guaranteed to produce exactly one top-level node - a nested
 * `<for>`/`<if>`, or any construct that renders multiple sibling elements,
 * produces several.
 *
 * The compiler's generated code builds each body into a DocumentFragment
 * and used to just return `fragment.firstChild`, discarding every sibling
 * after the first - so e.g. a `<for>` nested inside another `<for>` would
 * silently drop all but the very first item of the inner loop for every
 * outer iteration. This resolves a fragment to a single Node without
 * losing anything: the common single-child case is returned as-is (no
 * extra wrapper, preserving existing DOM output), and a multi-child
 * fragment is wrapped in a `display: contents` span, which is invisible
 * for layout/styling purposes but still gives the caller exactly one Node
 * to hold onto.
 */
export function resolveFragmentToNode(fragment: DocumentFragment): Node {
  if (fragment.childNodes.length === 0) {
    return document.createComment('');
  }
  if (fragment.childNodes.length === 1) {
    return fragment.firstChild as Node;
  }
  const wrapper = document.createElement('span');
  wrapper.setAttribute('data-teloce-fragment', '');
  wrapper.style.display = 'contents';
  wrapper.appendChild(fragment);
  return wrapper;
}
