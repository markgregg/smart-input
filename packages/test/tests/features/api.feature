Feature: SmartInput API

  Background:
    Given I navigate to the test app
    And the API reference is available

  Scenario: API insert method adds text at position
    When I insert "Hello" at position 0 using the API
    Then the editor should contain "Hello"

  Scenario: API replace method replaces text in range
    When I insert "Hello World" at position 0 using the API
    And I replace text from position 6 to 11 with "Universe" using the API
    Then the editor should contain "Universe"

  Scenario: API insertStyledBlock adds styled content
    When I insert a styled block "mention" with text "@user" at position 0 using the API
    Then the editor should contain "@user"
    And the styled block "mention" should be visible

  Scenario: API clear followed by insert
    When I insert "Old content" at position 0 using the API
    And I clear the editor using the API
    And I insert "New content" at position 0 using the API
    Then the editor should contain "New content"

  Scenario: API handles special characters
    When I insert "Hello @user #tag $100" at position 0 using the API
    Then the editor should contain "@user"
    And the editor should contain "#tag"
    And the editor should contain "$100"

  Scenario: API replaceAll with no matches does not error
    When I insert "Hello World" at position 0 using the API
    And I replace all occurrences of "foo" with "bar" using the API
    Then the editor should contain "Hello World"

  Scenario: API getElementById returns DOM element
    When I insert a styled block "test-block" with text "@test" at position 0 using the API
    Then the API getElementById for "test-block" should return an element
