# Instalação

## Pré-requisitos

Antes de começar, certifique-se de ter:

### Requisitos Obrigatórios

| Ferramenta | Versão Mínima | Como Verificar | Como Instalar |
|------------|---------------|----------------|---------------|
| **Node.js** | 18.0+ | `node --version` | [nodejs.org](https://nodejs.org) |
| **npm** | 9.0+ | `npm --version` | Vem com Node.js |
| **Git** | 2.30+ | `git --version` | [git-scm.com](https://git-scm.com) |

### Sistemas Operacionais Suportados

- **Windows 10/11** (PowerShell ou CMD)
- **macOS 12+** (Terminal ou iTerm)
- **Linux** (Ubuntu 20.04+, Debian, CentOS, etc.)

### 🔍 Verificação Rápida

```bash
# Verifique se tudo está instalado
node --version    # Deve mostrar v18.0.0 ou superior
npm --version     # Deve mostrar 9.0.0 ou superior
git --version     # Deve mostrar 2.30.0 ou superior
```
:::tip Dica para Windows Recomendamos usar o Windows Terminal ou PowerShell 7 para melhor experiência. Evite o CMD tradicional:::

## Instalação no Windows
### Pré-requisitos
1. Instalar Node.js (se não tiver):

- Baixe o instalador: https://nodejs.org/en/download/
- Execute o instalador (.msi)
- Siga o assistente de instalação

  :::Importante: Marque "Add to PATH" durante a instalação:::

- Verificar instalação:
npm --version
2. Instalação do CodeGen
Abra o PowerShell ou CMD como Administrador:

- Método 1 - NPM:

   npm install -g codegen-cli

## Instalação no macOS
   Pré-requisitos
1. Instalar Homebrew (se não tiver):

   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
2. Instalar Node.js:
    
3. brew install node
4. Verificar instalação:

   node --version

   npm --version
5. Instalação do CodeGen
- Método 1 - Homebrew (Recomendado):

  brew codegen 
  
  brew install codegen-cli

- Método 2 - NPM:
  
  npm install -g codegen-cli

Reinicie o Terminal
## Verificar Instalação
Copycodegen --version
#### Deve exibir: codegen-cli v1.0.0

which codegen
#### Deve exibir: /usr/local/bin/codegen ou /opt/homebrew/bin/codegen

## Configurar projeto
- cd ~/meu-projeto
- npx stk-codegen

:::A linha de prompts deve aparecer em seguida:::
