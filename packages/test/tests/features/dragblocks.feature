Feature: Drag Blocks Handler

  Background:
    Given I navigate to the test app with dragblocks enabled

  Scenario: Uneditable styled blocks are draggable
    Given the editor contains an uneditable styled block with id "block-1" and text "Draggable Block"
    When I verify the block "block-1" has draggable attribute
    Then the block "block-1" should have cursor style "grab"

  Scenario: Editable styled blocks are not draggable
    Given the editor contains an editable styled block with id "block-2" and text "Non-draggable Block"
    Then the block "block-2" should not have draggable attribute

  Scenario: Drag handlers are reattached after DOM mutation
    Given the editor contains an uneditable styled block with id "block-1" and text "Block"
    And the DOM is mutated by external code
    When I verify the block "block-1" has draggable attribute
    Then the block "block-1" should still have drag event handlers attached

  Scenario: Styled block with custom style maintains properties
    Given the editor contains an uneditable styled block with id "block-1" and text "Styled" and style "color: red"
    When I verify the block "block-1" has draggable attribute
    Then the block "block-1" should have cursor style "grab"

  Scenario: Cannot drag text blocks
    Given the editor contains a text block with text "Plain Text"
    Then the text should not have draggable attribute

  Scenario: Simple drag and drop - drag block over text
    When I type "Hello World" in the editor
    And I insert an uneditable styled block with id "tag-1" and text "TAG"
    And I simulate dragging block "tag-1" to position 6
    Then the block "tag-1" should be at a different position
