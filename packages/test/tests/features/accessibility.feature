Feature: Accessibility
  As a user of assistive technologies
  I want the editor to be fully accessible
  So that I can use it effectively regardless of my abilities

  Background:
    Given I navigate to the test app

  Scenario: Editor has no critical accessibility violations
    Then the page should have no critical accessibility violations

  Scenario: Editor has proper ARIA labels
    Then the editor should have proper ARIA labels

  Scenario: Keyboard navigation to editor
    When I navigate with keyboard to the editor
    Then the editor should be focused

  Scenario: Typing with keyboard
    When I navigate with keyboard to the editor
    And I type "Hello World"
    Then the editor value should contain "Hello World"

  Scenario: Arrow key navigation within editor
    When I click in the editor input area
    And I type "Test text"
    And I press "ArrowLeft"
    And I press "ArrowLeft"
    Then the editor should be focused

  Scenario: Home and End keys
    When I click in the editor input area
    And I type "Test text for navigation"
    And I press "Home"
    Then the editor should be focused
    When I press "End"
    Then the editor should be focused

  Scenario: Tab navigation
    When I navigate with keyboard to the editor
    Then the editor should be focused
    When I type "Test"
    And I press "Tab"
    Then I should be able to navigate with "Tab"

  Scenario: Shift+Tab reverse navigation
    When I navigate with keyboard to the editor
    And I press "Shift+Tab"
    Then I should be able to navigate with "Shift+Tab"

  Scenario: Enter key functionality
    When I click in the editor input area
    And I type "First line"
    And I press "Enter"
    Then the editor should be focused

  Scenario: Backspace key functionality
    When I click in the editor input area
    And I type "Delete me"
    And I press "Backspace" 3 times
    Then the editor should be focused

  Scenario: Delete key functionality
    When I click in the editor input area
    And I type "Remove this"
    And I press "Home"
    And I press "Delete" 3 times
    Then the editor should be focused

  Scenario: Color contrast compliance
    Then the component should have proper color contrast

  Scenario: Interactive elements are keyboard accessible
    Then all interactive elements should be keyboard accessible

  Scenario: Screen reader compatibility
    When I use screen reader mode
    Then the page should have no critical accessibility violations
    And semantic HTML should be used
