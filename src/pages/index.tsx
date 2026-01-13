import type { ReactNode } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';

export default function Home(): ReactNode {
  return (
    <Layout title="CodeGen Docs" description="Documentação Técnica CodeGen">
      <main
        style={{
          minHeight: '100vh',
          background: `
            radial-gradient(circle at 20% 80%, rgba(255,255,255,0.05), transparent 40%),
            radial-gradient(circle at 80% 20%, rgba(255,255,255,0.04), transparent 45%),
            #5a1f33
          `,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* Conteúdo central */}
        <div
          style={{
            textAlign: 'center',
            color: '#fff',
            maxWidth: 900,
            padding: '2rem',
          }}
        >
          {/* Bloco preto */}
          <div
            style={{
              backgroundColor: '#000',
              padding: '2.5rem 3rem',
              marginBottom: '2rem',
            }}
          >
            <h1
              style={{
                margin: 0,
                fontSize: '3.2rem',
                fontWeight: 800,
                lineHeight: 1.2,
              }}
            >
              Documentação
              <br />
              Técnica
            </h1>
          </div>

          {/* Subtítulo */}
          <h2
            style={{
              fontSize: '3rem',
              fontWeight: 700,
              marginBottom: '2.5rem',
            }}
          >
            Codegen
          </h2>

          {/* Botão */}
          <Link
            to="/contributors/intro/overview"
            style={{
              backgroundColor: '#fff',
              color: '#5a1f33',
              padding: '1rem 2.5rem',
              borderRadius: '10px',
              fontSize: '1.1rem',
              fontWeight: 700,
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            Começar Agora
          </Link>
        </div>

        {/* Texto ZupLabs */}
        <div
          style={{
            position: 'absolute',
            bottom: '2rem',
            left: '2rem',
            color: '#fff',
            fontSize: '1.2rem',
            fontWeight: 600,
            opacity: 0.9,
          }}
        >
          ZupLabs
        </div>
      </main>
    </Layout>
  );
}
