import React from 'react';
import {render, screen} from '@testing-library/react';
import {act} from 'react-dom/test-utils';
import {Numbers} from './Numbers';

it('renders numbers', async () => {
  // Mock the api
  let mockDB = [
    {'number': 0},
    {'number': 99},
  ];
  jest.spyOn(global, 'fetch').mockImplementation((url) => {
    switch (url) {
      case '/api/get':
        return Promise.resolve({
          json: () => Promise.resolve(mockDB),
        });
      case '/api/clear':
        mockDB = [];
        return Promise.resolve();
      case '/api/insert':
        const number = Math.floor(Math.random() * 100);
        mockDB.push(number);
        return Promise.resolve();
      default:
    }
  });

  // Use the asynchronous version of act to apply resolved promises
  await act(async () => {
    render(<Numbers />);
  });

  const listItems = screen.getAllByRole('listitem');
  expect(listItems).toHaveLength(2);
  expect(listItems[0].textContent).toBe('0');
  expect(listItems[1].textContent).toBe('99');
  expect(fetch).toHaveBeenCalledTimes(1);

  // A good read: https://testing-library.com/docs/queries/about/
  const clearButton = screen.getByText(/clear/i);
  await act(async () => {
    clearButton.click();
  });
  expect(fetch).toHaveBeenCalledTimes(3);
  expect(screen.queryAllByRole('listitem')).toHaveLength(0);

  const insertButton = screen.getByText(/insert/i);
  await act(async () => {
    insertButton.click();
  });
  expect(fetch).toHaveBeenCalledTimes(5);
  expect(screen.queryAllByRole('listitem')).toHaveLength(1);

  // remove the mock to ensure tests are completely isolated
  global.fetch.mockRestore();
});
