export const API_URL = import.meta.env.VITE_API_URL;

interface RequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: unknown;
}

// Arma el fetch (token, headers, chequeo de error) sin leer el body todavía
// — request() y requestBlob() comparten esto, y solo difieren en cómo
// terminan de leer la respuesta (.json() vs .blob()).
async function fetchConToken(path: string, options: RequestOptions = {}): Promise<Response> {
    const token = localStorage.getItem('token');

    const isFormData = options.body instanceof FormData

    const headers: Record<string, string> = {
        ...(!isFormData && {'Content-Type': 'application/json'}) 
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${path}`, {
        method: options.method ?? 'GET',
        headers,
        body: isFormData ? options.body as FormData : (options.body ? JSON.stringify(options.body) : undefined),
        
    });

    if (!response.ok) {
        if (response.status === 401 && !path.includes('/auth/login')) {
            localStorage.removeItem('token');
            window.location.href = '/login';
            throw new Error('Sesión inválida');
        }

        const error = await response.json().catch(() => null);
        throw new Error(error?.message ?? `Error ${response.status}`);
    }

    return response;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const response = await fetchConToken(path, options);
    return response.json();
}

// Para respuestas que no son JSON — un archivo (PDF, imagen, lo que sea).
async function requestBlob(path: string, options: RequestOptions = {}): Promise<Blob> {
    const response = await fetchConToken(path, options);
    return response.blob();
}

export const api = {
    get: <T>(path: string) => request<T>(path),
    post: <T>(path: string, body: unknown) => request<T>(path, { method: 'POST', body }),
    put: <T>(path: string, body: unknown) => request<T>(path, { method: 'PUT', body }),
    delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
    postBlob: (path: string, body: unknown) => requestBlob(path, { method: 'POST', body }),
    postFile: <T>(path: string, body: FormData) => request<T>(path, {method: 'POST', body})
};
