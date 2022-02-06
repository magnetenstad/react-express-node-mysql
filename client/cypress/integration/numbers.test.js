
it('should start by loading', () => {
  cy.visit('/');
  cy.get('h2').contains('Loading...');
});

it('should show header and buttons', () => {
  cy.visit('/');
  cy.wait(100);
  cy.get('h2').contains('Numbers:');
  cy.get('button').contains(/insert/i).should('exist');
  cy.get('button').contains(/clear/i).should('exist');
});

it('should clear and insert numbers', () => {
  cy.visit('/');
  cy.wait(100);
  cy.get('button').contains(/clear/i).click();
  cy.get('ul').find('li').should('have.length', 0);
  cy.get('button').contains(/insert/i).click();
  cy.get('ul').find('li').should('have.length', 1);
});
