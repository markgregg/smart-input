Feature: ReactBlocks Component

  Scenario: React component renders in styled block
    Given I navigate to the test app
    When I click the Add React Block button
    Then a React component should be rendered in the styled block

  Scenario: React component button is interactive
    Given I navigate to the test app
    When I click the Add React Block button
    Then a React component should be rendered in the styled block
    When I click the first React block button
    Then the first button counter should show "1"
    When I click the first React block button
    Then the first button counter should show "2"

  Scenario: Multiple styled blocks have separate React components
    Given I navigate to the test app
    When I click the Add React Block button
    And I click the Add React Block button
    Then the editor should contain multiple styled blocks
    And each styled block should have its own React component
    And each React component button should work independently

  Scenario: React component persists with styled block
    Given I navigate to the test app
    When I click the Add React Block button
    And I click the first React block button
    Then the first button counter should show "1"
    When I click in the editor input area
    And I type " more text"
    Then the first button counter should show "1"

  Scenario: React blocks are keyboard accessible
    Given I navigate to the test app
    When I click the Add React Block button
    Then all interactive elements should be keyboard accessible

  Scenario: React blocks have no accessibility violations
    Given I navigate to the test app
    When I click the Add React Block button
    Then the page should have no critical accessibility violations
