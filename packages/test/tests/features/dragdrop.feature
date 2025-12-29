Feature: Drag and Drop Handler

  Background:
    Given I navigate to the test app

  Scenario: Drag and drop zone is visible
    Then the drag and drop zone should be visible

  Scenario: Drag over shows drop indicator
    When I drag a file over the drop zone
    Then the drop indicator should be visible

  Scenario: Drag leave hides drop indicator
    When I drag a file over the drop zone
    And I drag the file away from the drop zone
    Then the drop indicator should not be visible

  Scenario: Drop an image file creates an ImageBlock
    When I drop an image file "test-image.png" into the drop zone
    Then an image element should be displayed in the editor
    And the image should have the correct source

  Scenario: Drop a PDF document creates a DocumentBlock
    When I drop a document file "test-document.pdf" into the drop zone
    Then a document icon should be displayed in the editor
    And the document icon should represent a PDF file

  Scenario: Drop multiple files creates multiple blocks
    When I drop multiple files into the drop zone
      | filename          | type               |
      | test-image1.png   | image/png          |
      | test-image2.jpg   | image/jpeg         |
      | test-document.pdf | application/pdf    |
    Then the editor should contain 3 file blocks
    And there should be 2 image elements
    And there should be 1 document icon

  Scenario: Image can be deleted from editor
    When I drop an image file "test-image.png" into the drop zone
    And I select the image in the editor
    And I press Delete
    Then the image should be removed from the editor

  Scenario: Document icon can be deleted from editor
    When I drop a document file "test-doc.pdf" into the drop zone
    And I select the document icon in the editor
    And I press Delete
    Then the document icon should be removed from the editor

  Scenario: Multiple image types are supported
    When I drop an image file "test.png" into the drop zone
    Then an image element should be displayed in the editor
    When I drop an image file "test.jpg" into the drop zone
    Then the editor should contain 2 file blocks
    When I drop an image file "test.gif" into the drop zone
    Then the editor should contain 3 file blocks

  Scenario: Text can be typed alongside dropped files
    When I drop an image file "test-image.png" into the drop zone
    And I click in the editor input area
    And I type "Some text before image"
    Then the editor should contain "Some text before image"
    And an image element should be displayed in the editor

  Scenario: Files remain after page interaction
    When I drop an image file "test-image.png" into the drop zone
    And I click in the editor input area
    And I type "Additional text"
    Then an image element should be displayed in the editor
    And the editor should contain "Additional text"

  Scenario: Delete button appears on image hover
    When I drop an image file "test-image.png" into the drop zone
    And I hover over the image in the editor
    Then the delete button should be visible on the image

  Scenario: Delete button appears on document hover
    When I drop a document file "test-doc.pdf" into the drop zone
    And I hover over the document icon in the editor
    Then the delete button should be visible on the document

  Scenario: Delete button is hidden when not hovering
    When I drop an image file "test-image.png" into the drop zone
    Then the delete button should not be visible on the image

  Scenario: Clicking delete button removes image
    When I drop an image file "test-image.png" into the drop zone
    And I hover over the image in the editor
    And I click the delete button on the image
    Then the image should be removed from the editor

  Scenario: Clicking delete button removes document
    When I drop a document file "test-doc.pdf" into the drop zone
    And I hover over the document icon in the editor
    And I click the delete button on the document
    Then the document icon should be removed from the editor

  Scenario: Deleting one file keeps others intact
    When I drop multiple files into the drop zone
      | filename          | type               |
      | test-image1.png   | image/png          |
      | test-image2.png   | image/png          |
      | test-document.pdf | application/pdf    |
    Then the editor should contain 3 file blocks
    When I hover over the first image in the editor
    And I click the delete button on the first image
    Then the editor should contain 2 file blocks
    And there should be 1 image elements
    And there should be 1 document icon
