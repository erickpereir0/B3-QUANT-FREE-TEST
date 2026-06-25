/**
 * Cliente de API Base para o B3-Quant-Free
 * Implementa tratamento centralizado de requisições HTTP, headers e interceptação de erros.
 */

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}

export class BaseApiClient {
  private baseUrl: string;

  constructor() {
    // Configura a URL base. Em ambiente de desenvolvimento pode apontar para localhost:8000 ou variável de ambiente
    this.baseUrl = ((import.meta as any).env?.VITE_API_URL as string) || "http://localhost:8000";
  }

  /**
   * Executa uma requisição HTTP genérica de forma assíncrona.
   */
  protected async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
    
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Erro na requisição à API (${response.status}): ${response.statusText}`
        );
      }

      // Trata retorno de endpoints que respondem JSON
      const jsonResponse = await response.json();
      return jsonResponse as T;
    } catch (error) {
      console.error(`[ApiClient Error] Falha ao conectar em ${url}:`, error);
      throw error;
    }
  }

  /**
   * Método GET tipado.
   */
  public async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  /**
   * Método POST tipado.
   */
  public async post<T>(endpoint: string, body: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    });
  }
}

export const baseApiClient = new BaseApiClient();
