export function deepClone<T>(obj: T): T {
	// 	return JSON.parse(JSON.stringify(obj));
	// structuredClone — это встроенная функция для глубокого клонирования, поддерживающая больше типов
	return structuredClone(obj);
}