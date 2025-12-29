Feature: CommitNotifier Component

  Scenario: CommitNotifier triggers onCommit when Enter key is pressed
    Given I navigate to the test app with commit notifier
    When I click in the editor input area
    And I type "Test commit text"
    And I press Enter
    Then the commit should be triggered with "Test commit text"
    And the editor should be empty

  Scenario: CommitNotifier saves history when commit succeeds
    Given I navigate to the test app with history enabled
    When I click in the editor input area
    And I type "First commit"
    And I press Enter
    And I type "Second commit"
    And I press Enter
    Then the history should contain 2 items
    And localStorage should have "commit-history" key

  Scenario: CommitNotifier respects maxHistory limit
    Given I navigate to the test app with history enabled and maxHistory 2
    When I click in the editor input area
    And I type "Commit 1"
    And I press Enter
    And I type "Commit 2"
    And I press Enter
    And I type "Commit 3"
    And I press Enter
    Then the history should contain 2 items
    And the history should contain "Commit 3"
    And the history should contain "Commit 2"
    And the history should not contain "Commit 1"

  Scenario: CommitNotifier uses custom history storage key
    Given I navigate to the test app with custom storage key "my-custom-key"
    When I click in the editor input area
    And I type "Custom storage"
    And I press Enter
    Then localStorage should have "my-custom-key" key
    And localStorage should not have "commit-history" key

  Scenario: CommitNotifier navigates history with ArrowUp on first line
    Given I navigate to the test app with history enabled
    When I commit "First entry"
    And I commit "Second entry"
    And I click in the editor input area
    And I press ArrowUp
    Then the editor should contain "Second entry"
    And I press ArrowUp
    Then the editor should contain "First entry"
    And I press ArrowUp
    Then the editor should contain "First entry"

  Scenario: CommitNotifier navigates history with ArrowDown on last line
    Given I navigate to the test app with history enabled
    When I commit "First entry"
    And I commit "Second entry"
    And I commit "Third entry"
    And I click in the editor input area
    And I press ArrowUp
    Then the editor should contain "Third entry"
    And I press ArrowDown
    Then the editor should be empty

  Scenario: CommitNotifier cycles through history correctly
    Given I navigate to the test app with history enabled
    When I commit "First entry"
    And I commit "Second entry"
    And I commit "Third entry"
    And I click in the editor input area
    And I type "Current text"
    And I press ArrowUp
    Then the editor should contain "Third entry"
    And I press ArrowUp
    Then the editor should contain "Second entry"
    And I press ArrowUp
    Then the editor should contain "First entry"
    And I press ArrowDown
    Then the editor should contain "Second entry"
    And I press ArrowDown
    Then the editor should contain "Third entry"
    And I press ArrowDown
    Then the editor should contain "Current text"
    And I press ArrowDown
    Then the editor should contain "Current text"

  Scenario: CommitNotifier restores current blocks when navigating to present
    Given I navigate to the test app with history enabled
    When I commit "History item"
    And I click in the editor input area
    And I type "Current text"
    And I press ArrowUp
    Then the editor should contain "History item"
    And I press ArrowDown
    Then the editor should contain "Current text"

  Scenario: CommitNotifier loads history from localStorage on mount
    Given localStorage is set with commit history "Persisted item"
    And I navigate to the test app with history enabled without clearing storage
    When I click in the editor input area
    And I press ArrowUp
    Then the editor should contain "Persisted item"

  Scenario: CommitNotifier does not commit during selection in progress
    Given I navigate to the test app with commit notifier
    When I click in the editor input area
    And I type "tes"
    And the typeahead dropdown is visible
    And I press Enter
    Then the commit should not be triggered
    And the typeahead selection should be made
    And the history should not navigate
