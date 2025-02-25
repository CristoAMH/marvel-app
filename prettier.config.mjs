const prettierConfig = {
  semi: true, // Usa punto y coma al final de las líneas
  singleQuote: true, // Usa comillas simples en lugar de dobles
  trailingComma: 'es5', // Agrega comas finales en objetos y arrays cuando sea válido en ES5
  tabWidth: 2, // Usa dos espacios en lugar de tabulaciones
  printWidth: 100, // Rompe las líneas si exceden los 100 caracteres
  arrowParens: 'avoid', // Omite los paréntesis en funciones de un solo argumento
  endOfLine: 'lf', // Asegura compatibilidad entre sistemas al usar saltos de línea LF
};

export default prettierConfig;
