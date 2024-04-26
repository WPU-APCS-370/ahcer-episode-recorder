
export function convertSnaps<T>(results) {
  return <T[]> results.docs.map(snap => {
    return {
      id: snap.id,
      ...<any> snap.data() as any
    };
  });
}

export function convertOneSnap<T>(snap) {
  return <T>{
      id: snap.id,
      ...<any> snap.data() as any
    };
}

