import { useEffect, RefObject, UIEvent, UIEventHandler } from 'react';
// TODO: explore `bivarianceHack` which is used in React types..

function setScrollMethods<T extends HTMLElement>(node: T, position: string) {
  switch(position) {
    case "bottom":
      return node.scrollHeight - node.scrollTop === node.clientHeight
    case "top":
      return node.scrollTop === 0
    default:
      return false
  } 
}

export function useScrollListener<T extends HTMLElement>(nodeRef: RefObject<T>, handleUIScroll: UIEventHandler<T>, position: "top" | "bottom") { 
  useEffect(() => {
    const handleScroll = (event: UIEvent<T>) => {
      const node = event.target as T;
      const isOnEdge = setScrollMethods(node, position);
      isOnEdge && handleUIScroll(event);
    } 
    
    // capture current ref node, because it might be changed
    //  by the time clean up function is called
    const currentNode = nodeRef.current;

    if(nodeRef.current)
      nodeRef.current.addEventListener('scroll', handleScroll as unknown as EventListener);
    return () => { currentNode && currentNode.removeEventListener('scroll', handleScroll as unknown as EventListener) };
  }, [handleUIScroll, nodeRef, position]);
}