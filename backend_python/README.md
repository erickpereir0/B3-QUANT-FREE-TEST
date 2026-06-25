# B3-Quant-Free: Python Backend Architecture

Este diretório contém a implementação completa em Python do motor quantitativo **B3-Quant-Free**. A estrutura foi desenhada sob os princípios da **Arquitetura Limpa** e do **Strategy Pattern**, facilitando a adição de novos modelos de valuation e fontes de dados sem poluir o núcleo da aplicação (core).

## 📂 Estrutura de Pastas Recomendada para o Projeto Python

```text
b3-quant-backend/
│
├── main.py                 # FastAPI Web Server (Ponto de entrada dos endpoints REST)
├── requirements.txt        # Dependências do Python (100% livres/gratuitas)
│
├── data/
│   ├── __init__.py
│   └── collector.py        # Coleta de dados via MetaTrader 5 & yfinance Fallback
│
├── core/
│   ├── __init__.py
│   └── valuation.py        # Motor de Valuation (Strategy Pattern)
│
├── nlp/
│   ├── __init__.py
│   └── analyzer.py         # Extrator de PDFs da CVM & Integração LLM (Groq / Ollama)
│
└── portfolio/
    ├── __init__.py
    └── optimizer.py        # Otimização de Portfólio (PyPortfolioOpt)
```

## 🚀 Como Executar o Backend Localmente

1. **Abra o terminal na pasta do backend** e crie um ambiente virtual:
   ```bash
   python -m venv venv
   source venv/bin/activate  # No Windows use: venv\Scripts\activate
   ```

2. **Instale as dependências**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Inicie o servidor local**:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

   O backend estará rodando em `http://localhost:8000` e a documentação interativa Swagger estará disponível em `http://localhost:8000/docs`.

---

## 🛠️ Conteúdo do arquivo `requirements.txt`
```text
fastapi==0.111.0
uvicorn==0.30.1
pydantic==2.7.4
MetaTrader5==5.0.4503; sys_platform == 'win32'
yfinance==0.2.40
pandas==2.2.2
numpy==1.26.4
PyMuPDF==1.24.5
pdfplumber==0.11.1
groq==0.9.0
langchain==0.2.5
langchain-groq==0.1.5
PyPortfolioOpt==1.5.5
```
