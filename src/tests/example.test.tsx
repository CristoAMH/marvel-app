import { render, screen } from '@testing-library/react';

function HelloWorld() {
  return <h1>Hello, World!</h1>;
}

test('renders HelloWorld component', () => {
  render(<HelloWorld />);
  expect(screen.getByText('Hello, World!')).toBeInTheDocument();
});
