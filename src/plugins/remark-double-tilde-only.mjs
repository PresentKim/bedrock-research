function unwrapSingleTilde(node, source) {
  if (!Array.isArray(node.children)) return;
  node.children = node.children.flatMap((child) => {
    unwrapSingleTilde(child, source);
    if (child.type !== 'delete') return [child];
    const start = child.position?.start?.offset;
    if (start === undefined || source.startsWith('~~', start)) return [child];
    return [{ type: 'text', value: '~' }, ...child.children, { type: 'text', value: '~' }];
  });
}

export default function remarkDoubleTildeOnly() {
  return (tree, file) => unwrapSingleTilde(tree, String(file.value));
}
