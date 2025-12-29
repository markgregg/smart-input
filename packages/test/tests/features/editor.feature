Feature: Editor Component

  Scenario: Editor component renders successfully
    Given I navigate to the test app
    Then the editor component should be visible
    And the editor should be ready for input

  Scenario: User can input text in Editor
    Given I navigate to the test app
    When I click in the editor input area
    And I type "Hello World"
    Then the editor value should contain "Hello World"

  Scenario: Editor handles paste operations
    Given I navigate to the test app
    When I click in the editor input area
    And I paste "Pasted content"
    Then the editor should contain "Pasted content"

  Scenario: Editor creates new line on Enter key press
    Given I navigate to the test app with line breaks enabled
    When I click in the editor input area
    And I type "First line"
    And I press Enter
    And I type "Second line"
    Then the editor should contain "First line"
    And the editor should contain "Second line"
    And the editor should have 2 lines

  Scenario: Multiple carriage returns create multiple lines
    Given I navigate to the test app with line breaks enabled
    When I click in the editor input area
    And I type "Line 1"
    And I press Enter
    And I press Enter
    And I type "Line 3"
    Then the editor should have 3 lines

  Scenario: User can delete text with Backspace
    Given I navigate to the test app
    When I click in the editor input area
    And I type "Hello World"
    And I press Backspace 5 times
    Then the editor value should contain "Hello "

  Scenario: User can undo changes with Ctrl+Z
    Given I navigate to the test app
    When I click in the editor input area
    And I type "First"
    And I type " Second"
    And I press Ctrl+Z
    Then the editor should be empty

  Scenario: User can select all text and delete it
    Given I navigate to the test app
    When I click in the editor input area
    And I type "Delete me"
    And I select all text
    And I press Backspace
    Then the editor should be empty

  Scenario: User can copy text
    Given I navigate to the test app
    When I click in the editor input area
    And I type "Copy this"
    And I select all text
    And I copy the selected text
    Then the clipboard should contain "Copy this"

  Scenario: Arrow keys navigate cursor position
    Given I navigate to the test app
    When I click in the editor input area
    And I type "Test"
    And I press ArrowLeft 2 times
    And I type "X"
    Then the editor value should contain "TeXst"

  Scenario: Home and End keys navigate to line boundaries
    Given I navigate to the test app
    When I click in the editor input area
    And I type "Middle"
    And I press Home
    And I type "Start "
    Then the editor value should contain "Start Middle"