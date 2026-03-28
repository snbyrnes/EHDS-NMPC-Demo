import type { EHDSElement, EHDSTreeNode } from '../types/ehds';
import structureDefinition from '../assets/EHDSMedication.json';

function getElements(): EHDSElement[] {
  return (structureDefinition as { snapshot: { element: EHDSElement[] } }).snapshot.element;
}

function getDepth(path: string): number {
  return path.split('.').length - 1;
}

function getParentPath(path: string): string {
  const parts = path.split('.');
  return parts.slice(0, -1).join('.');
}

function getElementName(path: string): string {
  const parts = path.split('.');
  return parts[parts.length - 1];
}

export function parseStructureDefinition(): EHDSTreeNode[] {
  const elements = getElements();
  const nodeMap = new Map<string, EHDSTreeNode>();

  for (const el of elements) {
    const node: EHDSTreeNode = {
      id: el.id,
      name: getElementName(el.path),
      path: el.path,
      short: el.short,
      definition: el.definition,
      cardinality: `${el.min}..${el.max}`,
      types: el.type?.map(t => t.code) ?? [],
      binding: el.binding,
      children: [],
      depth: getDepth(el.path),
      isExpanded: getDepth(el.path) < 2,
    };
    nodeMap.set(el.path, node);
  }

  const roots: EHDSTreeNode[] = [];

  for (const [path, node] of nodeMap) {
    if (node.depth === 0) {
      roots.push(node);
    } else {
      const parentPath = getParentPath(path);
      // Handle [x] choice types — parent is the element before the choice suffix
      const parent = nodeMap.get(parentPath);
      if (parent) {
        parent.children.push(node);
      } else {
        // Try finding parent by stripping [x] from path segments
        const altPath = parentPath.replace(/\[x\]/g, '[x]');
        const altParent = nodeMap.get(altPath);
        if (altParent) {
          altParent.children.push(node);
        } else {
          roots.push(node);
        }
      }
    }
  }

  return roots;
}

export function flattenTree(nodes: EHDSTreeNode[]): EHDSTreeNode[] {
  const result: EHDSTreeNode[] = [];
  function walk(nodeList: EHDSTreeNode[]) {
    for (const node of nodeList) {
      result.push(node);
      if (node.isExpanded && node.children.length > 0) {
        walk(node.children);
      }
    }
  }
  walk(nodes);
  return result;
}

export function findNodeByPath(nodes: EHDSTreeNode[], path: string): EHDSTreeNode | undefined {
  for (const node of nodes) {
    if (node.path === path) return node;
    const found = findNodeByPath(node.children, path);
    if (found) return found;
  }
  return undefined;
}

export function getAllNodes(nodes: EHDSTreeNode[]): EHDSTreeNode[] {
  const result: EHDSTreeNode[] = [];
  function walk(nodeList: EHDSTreeNode[]) {
    for (const node of nodeList) {
      result.push(node);
      walk(node.children);
    }
  }
  walk(nodes);
  return result;
}
