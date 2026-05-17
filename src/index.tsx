import React,{ useState } from 'react';
import { createRoot } from 'react-dom/client';
import { parse } from './parser';

function App() {
  const [ignore, setIgnore] = useState('');

  const [result, setResult] = useState<Awaited<ReturnType<typeof parse>> | undefined>();

  return (
    <>
      <h1>Kontrola účtovného denníka</h1>

      <div style={{ marginBottom: '1rem' }}>
        <button
          onClick={async () => {
            const result = await parse();
            setResult(result);
          }}
        >
          Vybrať XML súbor
        </button>
      </div>

      {result && (
        <div>
          <div>
            <strong>Počet "má dať":</strong> {result.totalCredit.toLocaleString()}
          </div>
          <div>
            <strong>Počet "dal":</strong> {result.totalDebit.toLocaleString()}
          </div>
          <div>
            <strong>Neshody:</strong> {result.mismatches.length.toLocaleString()}
          </div>
          <div style={{ marginTop: '1em' }}>
            {result.mismatches.map((mismatch) => (
              <div style={{ marginBottom: '0.5em' }} key={mismatch.name}>
                <strong>{mismatch.name}:</strong>{' '}
                {mismatch.value.toLocaleString(undefined, { style: 'currency', currency: 'EUR' })}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

const root = createRoot(document.getElementById('root')!);

root.render(<App />);
