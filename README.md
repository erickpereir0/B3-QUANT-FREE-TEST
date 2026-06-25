# 📈 B3-Quant-Free: Plataforma de Análise Quantitativa e Valuation

Bem-vindo ao **B3-Quant-Free**, uma ferramenta completa de análise quantitativa, valuation (Graham, Bazin, Peter Lynch, Gordon) e screener de ações e FIIs da B3.

Esta aplicação possui uma arquitetura moderna dividida em duas frentes de trabalho:
1. **Frontend Full-Stack**: Construído em **React (Vite) + TypeScript** com uma API Node.js intermediária para integração segura.
2. **Backend Quantitativo**: Desenvolvido em **Python** (FastAPI) para análise matemática de carteiras, coleta de dados (MetaTrader 5 / yfinance) e processamento de balanços da CVM.

---

## 🚀 Como Executar o Frontend (React + Node.js)

### Pré-requisitos
* **Node.js** (Recomendado v20 ou v22 LTS)
* **npm** ou **yarn**

### Passo a Passo

1. **Instale as dependências de Node**:
   ```bash
   npm install
   ```

2. **Inicie o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```
   *O projeto estará disponível por padrão em `http://localhost:3000`.*

---

### 💡 Solução de Problemas no Windows (Vite & TSX)

**Atualização:** Nós atualizamos o script `npm run dev` do projeto para compilar o servidor TypeScript `server.ts` de forma dinâmica usando `esbuild` antes de rodar com `node` puro. Isso **remove completamente os loaders dinâmicos** em tempo de execução que causavam o erro de caminhos do Windows no Node v21.2.0 (`TypeError [ERR_INVALID_URL_SCHEME]`).

Agora você pode rodar diretamente:
```bash
npm run dev
```

Se por algum motivo de ambiente local você ainda queira alternativas, você pode:

#### Opção A: Executar a Versão de Produção Compilada
```bash
# Compila o frontend e o servidor Node.js
npm run build

# Inicia o servidor otimizado em produção
npm run start
```

#### Opção B: Atualizar o Node.js
Atualize o Node.js para uma versão estável LTS mais recente (como **Node v22.x** ou superior), onde o bug nativo do carregador ESM do Windows no Node.js v21.2.0 foi corrigido pela equipe do Node.

#### Opção C: Executar o Frontend Separadamente
Caso queira testar apenas a interface visual estática sem o proxy intermediário de IA:
```bash
npx vite
```

---

## 🐍 Como Executar o Backend Quantitativo (Python)

O motor quantitativo em Python processa o carregamento inteligente de ativos reais da B3, roda otimização de portfólios e faz parsing de PDFs.

### Passo a Passo

1. **⚠️ ATENÇÃO: Navegue até a pasta do backend primeiro!** (Este passo é obrigatório para evitar o erro `Could not import module "main"`):
   ```bash
   cd backend_python
   ```

2. **Crie e ative o ambiente virtual (venv)** dentro da pasta `backend_python`:
   * **Linux/macOS**:
     ```bash
     python -m venv venv
     source venv/bin/activate
     ```
   * **Windows (PowerShell/CMD)**:
     ```powershell
     python -m venv venv
     .\venv\Scripts\activate
     ```
   * **Windows (Git Bash)**:
     ```bash
     source venv/Scripts/activate
     ```

3. **Instale as dependências**:
   ```bash
   pip install -r requirements.txt
   ```
   *Nota: No arquivo `requirements.txt`, relaxamos as versões e comentamos pacotes como `PyPortfolioOpt` por padrão para evitar que o terminal exija que você tenha o compilador do Microsoft Visual Studio C++ instalado localmente. Caso queira a otimização matemática de portfólio local avançada, instale o Build Tools do C++ e descomente a linha.*

4. **Inicie o servidor FastAPI (certifique-se de estar dentro da pasta `backend_python`)**:
   Se você puder executar diretamente:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   Caso o seu terminal exiba `bash: uvicorn: command not found` (muito comum no Git Bash do Windows), você deve executar o comando usando o módulo do Python diretamente pelo seu ambiente virtual ativado:
   ```bash
   python -m uvicorn main:app --reload --port 8000
   ```

   > **💡 Por que o erro `Could not import module "main"` acontece?**
   > Se você rodar o comando acima a partir da pasta raiz (`B3-QUANT-FREE-TEST`), o Python não encontrará o arquivo `main.py` porque ele está dentro de `backend_python/`. Certifique-se de fazer `cd backend_python` antes de iniciar o servidor!

   *O backend Python estará disponível em `http://localhost:8000` com documentação interativa Swagger em `http://localhost:8000/docs`.*

---

## 🎨 Principais Recursos Funcionais

* **Valuation Integrado**: Calcule instantaneamente o preço justo intrínseco por Graham, Décio Bazin, Peter Lynch e Modelo de Gordon de crescimento constante.
* **Busca e Screener**: Painéis dinâmicos e interativos de filtragem para Ações e FIIs da bolsa brasileira.
* **Busca de Tickers em Tempo Real**: Adicione e analise qualquer empresa ou fundo da B3 digitando o ticker diretamente na barra de busca (com fallback simulado inteligente caso o backend esteja off-line).
