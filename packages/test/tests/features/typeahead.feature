Feature: TypeaheadLookup Component

  Scenario: Typeahead appears when typing matching text
    Given I navigate to the test app
    When I click in the editor input area
    And I type "tes"
    Then the typeahead dropdown should be visible
    And the typeahead should show suggestions

  Scenario: Typeahead suggestion can be selected with click
    Given I navigate to the test app
    When I click in the editor input area
    And I type "tes"
    And I wait for typeahead to appear
    And I click the first typeahead suggestion
    Then the editor should contain "test"

  Scenario: Typeahead suggestion can be selected with Enter key
    Given I navigate to the test app
    When I click in the editor input area
    And I type "fre"
    And I wait for typeahead to appear
    And I press ArrowDown
    And I press Enter
    Then the editor should contain "fred"

  Scenario: Typeahead can be navigated with arrow keys
    Given I navigate to the test app
    When I click in the editor input area
    And I type "fen"
    And I wait for typeahead to appear
    And I press ArrowDown
    And I press Enter
    Then the editor should contain "fennel"

  Scenario: Typeahead closes when text no longer matches
    Given I navigate to the test app
    When I click in the editor input area
    And I type "tes"
    And I wait for typeahead to appear
    And I type "xyz"
    Then the typeahead dropdown should not be visible

  Scenario: Typeahead inserts styled text on selection
    Given I navigate to the test app
    When I click in the editor input area
    And I type "tes"
    And I wait for typeahead to appear
    And I click the first typeahead suggestion
    Then the editor should contain styled text

  Scenario: Typeahead dropdown is keyboard navigable
    Given I navigate to the test app
    When I click in the editor input area
    And I type "tes"
    And I wait for typeahead to appear
    Then the typeahead dropdown should be keyboard navigable

  Scenario: Typeahead has no accessibility violations
    Given I navigate to the test app
    When I click in the editor input area
    And I type "tes"
    And I wait for typeahead to appear
    Then the page should have no critical accessibility violations
