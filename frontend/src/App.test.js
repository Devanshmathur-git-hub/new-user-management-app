import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => <div>{children}</div>,
  Routes: ({ children }) => <div>{children}</div>,
  Route: ({ element }) => element,
  Navigate: () => null,
  useNavigate: () => jest.fn(),
  Link: ({ to, children }) => <a href={to}>{children}</a>,
  useSearchParams: () => [new URLSearchParams(), jest.fn()],
}));

jest.mock('react-csv', () => ({
  CSVLink: ({ children }) => <span>{children}</span>,
}));

test('renders login heading', () => {
  render(<App />);
  const headingElement = screen.getByRole('heading', { name: /welcome back/i });
  expect(headingElement).toBeInTheDocument();
});
