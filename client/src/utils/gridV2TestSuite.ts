/**
 * Grid V2 Test Suite - Comprehensive Testing for New Grid System
 * 
 * Tests all aspects of the new grid system:
 * - API endpoints validation
 * - Data integrity and deduplication
 * - Mapping functionality
 * - Real-time updates
 * - Performance and reliability
 */

export interface TestResult {
  testId: string;
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  duration?: number;
  result?: string;
  error?: string;
  details?: any;
}

export interface TestSuite {
  name: string;
  description: string;
  tests: TestResult[];
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime?: number;
  endTime?: number;
}

class GridV2TestRunner {
  private testResults: Map<string, TestResult> = new Map();
  private listeners: ((results: TestResult[]) => void)[] = [];

  // Subscribe to test updates
  subscribe(listener: (results: TestResult[]) => void) {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private updateTest(testId: string, updates: Partial<TestResult>) {
    const current = this.testResults.get(testId);
    if (current) {
      const updated = { ...current, ...updates };
      this.testResults.set(testId, updated);
      this.notifyListeners();
    }
  }

  private notifyListeners() {
    const results = Array.from(this.testResults.values());
    this.listeners.forEach(listener => listener(results));
  }

  // API Endpoint Tests
  async testDataFetching(): Promise<TestResult> {
    const testId = 'data-fetching';
    const test: TestResult = {
      testId,
      name: 'Data Fetching',
      status: 'running'
    };
    
    this.testResults.set(testId, test);
    this.notifyListeners();
    
    const startTime = Date.now();
    
    try {
      // Test dots endpoint
      const dotsResponse = await fetch('/api/grid-v2/dots', {
        credentials: 'include'
      });
      
      if (!dotsResponse.ok) {
        throw new Error(`Dots API failed: ${dotsResponse.status}`);
      }
      
      const dotsData = await dotsResponse.json();
      
      // Test wheels endpoint
      const wheelsResponse = await fetch('/api/grid-v2/wheels', {
        credentials: 'include'
      });
      
      if (!wheelsResponse.ok) {
        throw new Error(`Wheels API failed: ${wheelsResponse.status}`);
      }
      
      const wheelsData = await wheelsResponse.json();
      
      // Test chakras endpoint
      const chakrasResponse = await fetch('/api/grid-v2/chakras', {
        credentials: 'include'
      });
      
      if (!chakrasResponse.ok) {
        throw new Error(`Chakras API failed: ${chakrasResponse.status}`);
      }
      
      const chakrasData = await chakrasResponse.json();
      
      // Test stats endpoint
      const statsResponse = await fetch('/api/grid-v2/stats', {
        credentials: 'include'
      });
      
      if (!statsResponse.ok) {
        throw new Error(`Stats API failed: ${statsResponse.status}`);
      }
      
      const statsData = await statsResponse.json();
      
      const duration = Date.now() - startTime;
      
      this.updateTest(testId, {
        status: 'passed',
        duration,
        result: `Successfully fetched: ${dotsData.count || 0} dots, ${wheelsData.count || 0} wheels, ${chakrasData.count || 0} chakras`,
        details: {
          dots: dotsData.count || 0,
          wheels: wheelsData.count || 0,
          chakras: chakrasData.count || 0,
          stats: statsData.data
        }
      });
      
    } catch (error) {
      this.updateTest(testId, {
        status: 'failed',
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    return this.testResults.get(testId)!;
  }

  // Test deduplication
  async testDeduplication(): Promise<TestResult> {
    const testId = 'deduplication';
    const test: TestResult = {
      testId,
      name: 'Data Deduplication',
      status: 'running'
    };
    
    this.testResults.set(testId, test);
    this.notifyListeners();
    
    const startTime = Date.now();
    
    try {
      // Fetch all data
      const [dotsRes, wheelsRes, chakrasRes] = await Promise.all([
        fetch('/api/grid-v2/dots', { credentials: 'include' }),
        fetch('/api/grid-v2/wheels', { credentials: 'include' }),
        fetch('/api/grid-v2/chakras', { credentials: 'include' })
      ]);
      
      const [dotsData, wheelsData, chakrasData] = await Promise.all([
        dotsRes.json(),
        wheelsRes.json(),
        chakrasRes.json()
      ]);
      
      const dots = dotsData.data || [];
      const wheels = wheelsData.data || [];
      const chakras = chakrasData.data || [];
      
      // Check for duplicate IDs
      const dotIds = dots.map((d: any) => d.id);
      const wheelIds = wheels.map((w: any) => w.id);
      const chakraIds = chakras.map((c: any) => c.id);
      
      const duplicateDots = dotIds.length !== new Set(dotIds).size;
      const duplicateWheels = wheelIds.length !== new Set(wheelIds).size;
      const duplicateChakras = chakraIds.length !== new Set(chakraIds).size;
      
      if (duplicateDots || duplicateWheels || duplicateChakras) {
        throw new Error(`Duplicates found: dots=${duplicateDots}, wheels=${duplicateWheels}, chakras=${duplicateChakras}`);
      }
      
      // Check for orphaned mappings
      const orphanedDots = dots.filter((d: any) => 
        (d.wheelId && !wheels.find((w: any) => w.id === d.wheelId)) ||
        (d.chakraId && !chakras.find((c: any) => c.id === d.chakraId))
      );
      
      const orphanedWheels = wheels.filter((w: any) => 
        w.chakraId && !chakras.find((c: any) => c.id === w.chakraId)
      );
      
      if (orphanedDots.length > 0 || orphanedWheels.length > 0) {
        throw new Error(`Orphaned references found: ${orphanedDots.length} dots, ${orphanedWheels.length} wheels`);
      }
      
      const duration = Date.now() - startTime;
      
      this.updateTest(testId, {
        status: 'passed',
        duration,
        result: `No duplicates or orphaned references found. Data integrity verified.`,
        details: {
          totalElements: dots.length + wheels.length + chakras.length,
          uniqueElements: new Set([...dotIds, ...wheelIds, ...chakraIds]).size
        }
      });
      
    } catch (error) {
      this.updateTest(testId, {
        status: 'failed',
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    return this.testResults.get(testId)!;
  }

  // Test mapping functionality
  async testMappingFunctionality(): Promise<TestResult> {
    const testId = 'mapping-functionality';
    const test: TestResult = {
      testId,
      name: 'Mapping Functionality',
      status: 'running'
    };
    
    this.testResults.set(testId, test);
    this.notifyListeners();
    
    const startTime = Date.now();
    
    try {
      // Get available data
      const dotsRes = await fetch('/api/grid-v2/dots', { credentials: 'include' });
      const wheelsRes = await fetch('/api/grid-v2/wheels', { credentials: 'include' });
      const chakrasRes = await fetch('/api/grid-v2/chakras', { credentials: 'include' });
      
      const dotsData = await dotsRes.json();
      const wheelsData = await wheelsRes.json();
      const chakrasData = await chakrasRes.json();
      
      const dots = dotsData.data || [];
      const wheels = wheelsData.data || [];
      const chakras = chakrasData.data || [];
      
      let testsPassed = 0;
      let totalTests = 0;
      const testDetails: string[] = [];
      
      // Test dot to wheel mapping if we have both
      if (dots.length > 0 && wheels.length > 0) {
        totalTests++;
        const unlinkedDot = dots.find((d: any) => !d.wheelId && !d.chakraId);
        const availableWheel = wheels.find((w: any) => !w.chakraId);
        
        if (unlinkedDot && availableWheel) {
          try {
            const mapResponse = await fetch('/api/grid-v2/map/dot-to-wheel', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ dotId: unlinkedDot.id, wheelId: availableWheel.id })
            });
            
            if (mapResponse.ok) {
              testsPassed++;
              testDetails.push('✓ Dot to wheel mapping works');
              
              // Test unmapping
              const unmapResponse = await fetch('/api/grid-v2/map/dot-to-wheel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ dotId: unlinkedDot.id })
              });
              
              if (unmapResponse.ok) {
                testDetails.push('✓ Dot unmapping works');
              }
            } else {
              testDetails.push('✗ Dot to wheel mapping failed');
            }
          } catch (error) {
            testDetails.push('✗ Dot to wheel mapping error');
          }
        } else {
          testDetails.push('- No suitable dot/wheel pair for mapping test');
        }
      }
      
      // Test wheel to chakra mapping if we have both
      if (wheels.length > 0 && chakras.length > 0) {
        totalTests++;
        const unlinkedWheel = wheels.find((w: any) => !w.chakraId);
        const availableChakra = chakras[0];
        
        if (unlinkedWheel && availableChakra) {
          try {
            const mapResponse = await fetch('/api/grid-v2/map/wheel-to-chakra', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ wheelId: unlinkedWheel.id, chakraId: availableChakra.id })
            });
            
            if (mapResponse.ok) {
              testsPassed++;
              testDetails.push('✓ Wheel to chakra mapping works');
              
              // Test unmapping
              const unmapResponse = await fetch('/api/grid-v2/map/wheel-to-chakra', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ wheelId: unlinkedWheel.id })
              });
              
              if (unmapResponse.ok) {
                testDetails.push('✓ Wheel unmapping works');
              }
            } else {
              testDetails.push('✗ Wheel to chakra mapping failed');
            }
          } catch (error) {
            testDetails.push('✗ Wheel to chakra mapping error');
          }
        } else {
          testDetails.push('- No suitable wheel/chakra pair for mapping test');
        }
      }
      
      const duration = Date.now() - startTime;
      
      if (totalTests === 0) {
        this.updateTest(testId, {
          status: 'passed',
          duration,
          result: 'No data available for mapping tests',
          details: { tests: testDetails }
        });
      } else if (testsPassed === totalTests) {
        this.updateTest(testId, {
          status: 'passed',
          duration,
          result: `All mapping tests passed (${testsPassed}/${totalTests})`,
          details: { tests: testDetails }
        });
      } else {
        this.updateTest(testId, {
          status: 'failed',
          duration,
          error: `Some mapping tests failed (${testsPassed}/${totalTests})`,
          details: { tests: testDetails }
        });
      }
      
    } catch (error) {
      this.updateTest(testId, {
        status: 'failed',
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    return this.testResults.get(testId)!;
  }

  // Test real-time updates
  async testRealTimeUpdates(): Promise<TestResult> {
    const testId = 'realtime-updates';
    const test: TestResult = {
      testId,
      name: 'Real-time Updates',
      status: 'running'
    };
    
    this.testResults.set(testId, test);
    this.notifyListeners();
    
    const startTime = Date.now();
    
    try {
      // Test SSE connection
      const eventSource = new EventSource('/api/grid-v2/events', {
        withCredentials: true
      });
      
      let connectionEstablished = false;
      let eventsReceived = 0;
      
      const connectionPromise = new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('SSE connection timeout'));
        }, 5000);
        
        eventSource.onopen = () => {
          connectionEstablished = true;
          clearTimeout(timeout);
          resolve();
        };
        
        eventSource.addEventListener('connected', (event) => {
          eventsReceived++;
          console.log('SSE Connected event received:', event.data);
        });
        
        eventSource.addEventListener('heartbeat', (event) => {
          eventsReceived++;
          console.log('SSE Heartbeat received');
        });
        
        eventSource.onerror = (error) => {
          clearTimeout(timeout);
          reject(new Error('SSE connection error'));
        };
      });
      
      await connectionPromise;
      
      // Wait a bit for potential events
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      eventSource.close();
      
      const duration = Date.now() - startTime;
      
      this.updateTest(testId, {
        status: 'passed',
        duration,
        result: `SSE connection established successfully. Received ${eventsReceived} events.`,
        details: {
          connectionEstablished,
          eventsReceived
        }
      });
      
    } catch (error) {
      this.updateTest(testId, {
        status: 'failed',
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    return this.testResults.get(testId)!;
  }

  // Test position saving
  async testPositionSaving(): Promise<TestResult> {
    const testId = 'position-saving';
    const test: TestResult = {
      testId,
      name: 'Position Saving',
      status: 'running'
    };
    
    this.testResults.set(testId, test);
    this.notifyListeners();
    
    const startTime = Date.now();
    
    try {
      // Get a dot to test with
      const dotsRes = await fetch('/api/grid-v2/dots', { credentials: 'include' });
      const dotsData = await dotsRes.json();
      const dots = dotsData.data || [];
      
      if (dots.length === 0) {
        this.updateTest(testId, {
          status: 'passed',
          duration: Date.now() - startTime,
          result: 'No dots available for position testing'
        });
        return this.testResults.get(testId)!;
      }
      
      const testDot = dots[0];
      const testPosition = { x: 100, y: 200 };
      
      // Test position save
      const saveResponse = await fetch('/api/grid-v2/position/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          elementType: 'dot',
          elementId: testDot.id,
          position: testPosition,
          validateCollision: false
        })
      });
      
      if (!saveResponse.ok) {
        throw new Error('Position save failed');
      }
      
      // Verify position was saved
      const verifyRes = await fetch('/api/grid-v2/dots', { credentials: 'include' });
      const verifyData = await verifyRes.json();
      const updatedDot = verifyData.data.find((d: any) => d.id === testDot.id);
      
      if (!updatedDot) {
        throw new Error('Dot not found after position save');
      }
      
      if (updatedDot.positionX !== testPosition.x || updatedDot.positionY !== testPosition.y) {
        throw new Error('Position not saved correctly');
      }
      
      const duration = Date.now() - startTime;
      
      this.updateTest(testId, {
        status: 'passed',
        duration,
        result: `Position saved and verified successfully`,
        details: {
          dotId: testDot.id,
          position: testPosition,
          savedPosition: { x: updatedDot.positionX, y: updatedDot.positionY }
        }
      });
      
    } catch (error) {
      this.updateTest(testId, {
        status: 'failed',
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    return this.testResults.get(testId)!;
  }

  // Run all tests
  async runAllTests(): Promise<TestResult[]> {
    console.log('🧪 Starting Grid V2 comprehensive test suite...');
    
    const tests = [
      () => this.testDataFetching(),
      () => this.testDeduplication(),
      () => this.testMappingFunctionality(),
      () => this.testRealTimeUpdates(),
      () => this.testPositionSaving()
    ];
    
    const results: TestResult[] = [];
    
    for (const test of tests) {
      try {
        const result = await test();
        results.push(result);
        console.log(`✓ ${result.name}: ${result.status}`);
      } catch (error) {
        console.error(`✗ Test failed:`, error);
      }
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    const passed = results.filter(r => r.status === 'passed').length;
    const total = results.length;
    
    console.log(`🏁 Test suite completed: ${passed}/${total} tests passed`);
    
    return results;
  }

  // Get current test results
  getResults(): TestResult[] {
    return Array.from(this.testResults.values());
  }

  // Clear all test results
  clearResults() {
    this.testResults.clear();
    this.notifyListeners();
  }
}

// Export singleton instance
export const gridV2TestRunner = new GridV2TestRunner();