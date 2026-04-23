import { useState } from 'react';
import { appState } from '../state';
import { exportGeometry } from '../utils/CPUDeformer';

export const IterationUI = ({ currentParams, setters }: any) => {
  const [iters, setIters] = useState<any[]>([]);
  const [exporting, setExporting] = useState(false);

  const handleSave = () => {
    const name = prompt("Name this iteration:");
    if (!name) return;
    
    setIters([...iters, {
      id: Math.random().toString(36).substring(7),
      name,
      curvePoints: appState.curvePoints.map(p => p.clone()),
      profileParams: { ...currentParams.profileParams },
      textureParams: { ...currentParams.textureParams },
      geoParams: { ...currentParams.geoParams }
    }]);
  };

  const handleLoad = (iter: any) => {
    appState.curvePoints = iter.curvePoints.map((p: any) => p.clone());
    setters.setProfileConfig(iter.profileParams);
    setters.setTextureConfig(iter.textureParams);
    setters.setGeoConfig(iter.geoParams);
  };

  const delIter = (id: string) => setIters(iters.filter(i => i.id !== id));

  const handleExport = (format: 'stl'|'obj'|'gltf') => {
      setExporting(true);
      setTimeout(() => {
          try {
              exportGeometry(format, currentParams.geoParams, currentParams.profileParams, currentParams.textureParams, appState.curvePoints);
          } catch(e) {
              console.error(e);
          }
          setExporting(false);
      }, 50);
  }

  return (
    <div style={{ position: 'absolute', bottom: 20, left: 20, width: 280, display: 'flex', flexDirection: 'column', gap: 10, zIndex: 1000, fontFamily: 'Outfit' }}>
       {/* Iterations */}
       <div style={{ background: '#181c20', borderRadius: 8, padding: 15, color: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
         <h3 style={{ margin: '0 0 10px 0', fontSize: 16, borderBottom: '1px solid #333', paddingBottom: 5 }}>Iteration Stack</h3>
         <button onClick={handleSave} style={{ width: '100%', padding: '8px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', marginBottom: 10 }}>
           + Save Current State
         </button>
         <div style={{ display: 'flex', flexDirection: 'column', gap: 5, maxHeight: 150, overflowY: 'auto' }}>
            {iters.length === 0 && <span style={{ fontSize: 12, color: '#aaa' }}>No iterations saved...</span>}
            {iters.map((iter) => (
               <div key={iter.id} style={{ display: 'flex', justifyContent: 'space-between', background: '#252a30', padding: '6px 10px', borderRadius: 4, alignItems: 'center' }}>
                  <span style={{ fontSize: 14, cursor: 'pointer', flex: 1 }} onClick={() => handleLoad(iter)}>{iter.name}</span>
                  <button onClick={() => delIter(iter.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0 }}>✕</button>
               </div>
            ))}
         </div>
       </div>

       {/* Export */}
       <div style={{ background: '#181c20', borderRadius: 8, padding: 15, color: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
         <h3 style={{ margin: '0 0 10px 0', fontSize: 16, borderBottom: '1px solid #333', paddingBottom: 5 }}>Export Geometry</h3>
         <div style={{ display: 'flex', gap: 8 }}>
            <button disabled={exporting} onClick={() => handleExport('obj')} style={{ flex: 1, padding: '8px', background: '#a855f7', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>OBJ</button>
         </div>
         <p style={{ fontSize: 10, color: '#aaa', margin: '5px 0 0 0', lineHeight: 1.2 }}>Note: Native runtime FBX export is unsupported. Use standard OBJ format instead.</p>
         {exporting && <p style={{ fontSize: 12, color: '#fcd34d', margin: '5px 0 0 0' }}>Processing vertex cache...!</p>}
       </div>
    </div>
  );
}
