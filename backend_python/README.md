# 🐍 B3-Quant-Free: Python Backend Architecture

Este diretório contém a implementação em Python do motor quantitativo **B3-Quant-Free**. A estrutura foi desenhada sob os princípios da **Arquitetura Limpa** e do **Strategy Pattern**, facilitando a adição de novos modelos de valuation e fontes de dados sem poluir o núcleo da aplicação.

---

## 📂 Estrutura de Pastas Recomendada para o Projeto Python

```text
b3-quant-backend/
│
├── main.py                 # FastAPI Web Server (Ponto de entrada dos endpoints REST)
├── requirements.txt        # Dependências do Python (100% livres/gratuitas)
├── valuation.py            # Motor de Valuation (Graham, Bazin, Gordon, etc.)
├── data.py                 # Coleta e processamento de dados financeiros
└── nlp.py                  # Extrator de PDFs da CVM & Integração LLM
```

---

## 🚀 Como Executar o Backend Localmente

1. **Abra o terminal na pasta do backend** e crie um ambiente virtual:
   ```bash
   python -m venv venv
   ```

2. **Ative o ambiente virtual**:
   * **Windows (PowerShell/CMD)**:
     ```powershell
     .\venv\Scripts\activate
     ```
   * **Linux/macOS**:
     ```bash
     source venv/bin/activate
     ```

3. **Instale as dependências**:
   ```bash
   pip install -r requirements.txt
   ```
   
   *Nota sobre o Windows:* O pacote `PyPortfolioOpt` foi comentado nas dependências padrão para evitar falhas de compilação caso você não possua o compilador C++ do Visual Studio Build Tools instalado. Se desejar usar a otimização de portfólio por fronteira eficiente localmente, instale o compilador C++ correspondente e descomente a linha no arquivo `requirements.txt`.

4. **Inicie o servidor local**:
   Se puder executar diretamente:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   Caso o terminal retorne `bash: uvicorn: command not found` (comum no Git Bash do Windows devido aos caminhos do PATH), execute usando o executável do Python associado ao venv ativo:
   ```bash
   python -m uvicorn main:app --reload --port 8000
   ```

   O backend estará rodando em `http://localhost:8000` e a documentação interativa Swagger estará disponível em `http://localhost:8000/docs`.

---

## 🛠️ Conteúdo do arquivo `requirements.txt` atualizado

```text
fastapi>=0.111.0
uvicorn>=0.30.1
pydantic>=2.7.4
MetaTrader5>=5.0.0; sys_platform == 'win32'
yfinance>=0.2.40
pandas>=2.2.3
numpy>=2.1.0
PyMuPDF>=1.24.5
pdfplumber>=0.11.1
groq>=0.9.0
langchain>=0.2.5
langchain-groq>=0.1.5
# PyPortfolioOpt>=1.5.5  # Opcional (Requer Visual Studio C++ Compiler no Windows)
```
