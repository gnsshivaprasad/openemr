<?php

namespace OpenEMR\Tests\RestControllers;

use PHPUnit\Framework\TestCase;
use OpenEMR\RestControllers\PatientRestController;
use OpenEMR\Tests\Fixtures\FixtureManager;

/**
 * @coversDefaultClass OpenEMR\RestControllers\PatientRestController
 */
class PatientRestControllerTest extends TestCase
{
    const PATIENT_API_URL = "/apis/api/patient";

    private $patientData;
    private $patientController;
    private $fixtureManager;

    protected function setUp(): void
    {
        $this->patientData = array(
            "pubpid" => "test-fixture-doe",
            "title" => "Mr.",
            "fname" => "John",
            "mname" => "D",
            "lname" => "Doe",
            "ss" => "111-11-1111",
            "street" => "2100 Anyhoo Lane",
            "postal_code" => "92101",
            "city" => "San Diego",
            "state" => "CA",
            "phone_contact" => "(555) 555-5551",
            "phone_home" => "(555) 555-5552",
            "phone_biz" => "(555) 555-5553",
            "email" => "john.doe@email.com",
            "DOB" => "1977-05-01",
            "sex" => "Male",
            "status" => "single",
            "drivers_license" => "102245737"
        );

        $this->fixtureManager = new FixtureManager();
        $this->patientController = new PatientRestController();
    }

    protected function tearDown(): void
    {
        $this->fixtureManager->removePatientFixtures();
    }

    /**
     * @cover ::post with invalid data
     */
    public function testPostInvalidData()
    {
        unset($this->patientData["fname"]);
        $actualResult = $this->patientController->post($this->patientData);
        $this->assertEquals(400, http_response_code());
        $this->assertEquals(1, count($actualResult["validationErrors"]));
        $this->assertEquals(0, count($actualResult["internalErrors"]));
        $this->assertEquals(0, count($actualResult["data"]));
    }

    /**
     * @cover ::post with valid data
     */
    public function testPost()
    {
        $actualResult = $this->patientController->post($this->patientData);
        $this->assertEquals(201, http_response_code());
        $this->assertEquals(0, count($actualResult["validationErrors"]));
        $this->assertEquals(0, count($actualResult["internalErrors"]));
        $this->assertEquals(1, count($actualResult["data"]));

        $patientPid = $actualResult["data"]["pid"];
        $this->assertIsInt($patientPid);
        $this->assertGreaterThan(0, $patientPid);
    }

    /**
     * @cover ::put with invalid data
     */
    public function testPutInvalidData()
    {
        $actualResult = $this->patientController->post($this->patientData);
        $this->assertEquals(201, http_response_code());
        $this->assertEquals(1, count($actualResult["data"]));

        $actualResult = $this->patientController->put("not-a-pid", $this->patientData);
        $this->assertEquals(400, http_response_code());
        $this->assertEquals(1, count($actualResult["validationErrors"]));
        $this->assertEquals(0, count($actualResult["internalErrors"]));
        $this->assertEquals(0, count($actualResult["data"]));
    }

    /**
     * @cover ::put with valid data
     */
    public function testPut()
    {
        $actualResult = $this->patientController->post($this->patientData);
        $this->assertEquals(201, http_response_code());
        $this->assertEquals(1, count($actualResult["data"]));

        $patientPid = $actualResult["data"]["pid"];
        $this->patientData["phone_home"] = "111-111-1111";
        $actualResult = $this->patientController->put($patientPid, $this->patientData);

        $this->assertEquals(200, http_response_code());
        $this->assertEquals(0, count($actualResult["validationErrors"]));
        $this->assertEquals(0, count($actualResult["internalErrors"]));
        $this->assertNotNull($actualResult["data"]);

        $updatedPatient = $actualResult["data"];
        $this->assertIsArray($updatedPatient);
        $this->assertEquals($this->patientData["phone_home"], $updatedPatient["phone_home"]);
    }

    /**
     * @cover ::getOne with an invalid pid
     */
    public function testGetOneInvalidPid()
    {
        $actualResult = $this->patientController->getOne("not-a-pid");
        $this->assertEquals(400, http_response_code());
        $this->assertEquals(1, count($actualResult["validationErrors"]));
        $this->assertEquals(0, count($actualResult["internalErrors"]));
        $this->assertEquals([], $actualResult["data"]);
    }

    /**
     * @cover ::getOne with a valid pid
     */
    public function testGetOne()
    {
        // create a record
        $postResult = $this->patientController->post($this->patientData);
        $postedPid = $postResult["data"]["pid"];
        $this->assertIsInt($postedPid);
        $this->assertGreaterThan(0, $postedPid);

        // confirm the pid matches what was requested
        $actualResult = $this->patientController->getOne($postedPid);
        $this->assertEquals($postedPid, $actualResult["data"]["pid"]);
    }

    /**
     * @cover ::getAll
     */
    public function testGetAll()
    {
        $this->fixtureManager->installPatientFixtures();
        $searchResult = $this->patientController->getAll(array("state" => "CA"));
        
        $this->assertEquals(200, http_response_code());
        $this->assertEquals(0, count($searchResult["validationErrors"]));
        $this->assertEquals(0, count($searchResult["internalErrors"]));
        $this->assertGreaterThan(1, count($searchResult["data"]));

        foreach ($searchResult["data"] as $index => $searchResult) {
            $this->assertEquals("CA", $searchResult["state"]);
        }
    }
}
