Feature: Styled Block Mouse and Click Events

  Background:
    Given I navigate to the test app with mouse events enabled
    And the API reference is available

  Scenario: Styled block onClick event fires when clicked
    Given I set up a click event listener for styled blocks
    When I insert a styled block "clickable" with text "@mention" at position 0 using the API with event handlers
    And I click on the styled block "clickable"
    Then the click event should have been triggered

  Scenario: Styled block onMouseEnter event fires on hover
    Given I set up a mouseenter event listener for styled blocks
    When I insert a styled block "hoverable" with text "@user" at position 0 using the API with event handlers
    And I hover over the styled block "hoverable"
    Then the mouseenter event should have been triggered

  Scenario: Styled block onMouseLeave event fires when leaving
    Given I set up a mouseleave event listener for styled blocks
    When I insert a styled block "leaveable" with text "@test" at position 0 using the API with event handlers
    And I hover over the styled block "leaveable"
    And I move mouse away from the styled block "leaveable"
    Then the mouseleave event should have been triggered

  Scenario: Styled block onMouseDown event fires on mouse press
    Given I set up a mousedown event listener for styled blocks
    When I insert a styled block "pressable" with text "@down" at position 0 using the API with event handlers
    And I press mouse down on the styled block "pressable"
    Then the mousedown event should have been triggered

  Scenario: Styled block onMouseUp event fires on mouse release
    Given I set up a mouseup event listener for styled blocks
    When I insert a styled block "releasable" with text "@up" at position 0 using the API with event handlers
    And I press mouse down on the styled block "releasable"
    And I release mouse on the styled block "releasable"
    Then the mouseup event should have been triggered

  Scenario: Styled block onMouseOver event fires when hovering
    Given I set up a mouseover event listener for styled blocks
    When I insert a styled block "overable" with text "@over" at position 0 using the API with event handlers
    And I move mouse over the styled block "overable"
    Then the mouseover event should have been triggered

  Scenario: Styled block onMouseMove event fires when moving within block
    Given I set up a mousemove event listener for styled blocks
    When I insert a styled block "moveable" with text "@move" at position 0 using the API with event handlers
    And I move mouse within the styled block "moveable"
    Then the mousemove event should have been triggered

  Scenario: Multiple events fire in correct sequence
    Given I set up all mouse event listeners for styled blocks
    When I insert a styled block "multi-event" with text "@multi" at position 0 using the API with event handlers
    And I perform mouse sequence on the styled block "multi-event"
    Then the events should have fired in order "mouseover,mouseenter,mousedown,mouseup,click"

  Scenario: Event target is the styled block element
    Given I set up a click event listener for styled blocks
    When I insert a styled block "target-test" with text "@target" at position 0 using the API with event handlers
    And I click on the styled block "target-test"
    Then the event target should be the styled block "target-test"
