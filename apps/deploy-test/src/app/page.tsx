export const runtime = 'edge';

export default function Home() {
  return (
    <main style={{ 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#000',
      color: '#fff',
      fontFamily: 'system-ui'
    }}>
      <h1>Cloudflare Deploy Test: SUCCESS</h1>
    </main>
  );
}
