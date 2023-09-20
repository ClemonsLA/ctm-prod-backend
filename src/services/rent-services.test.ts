import { checkDate,delayFunction,incrementTotalRentTime } from "./rent-services";
import { describe, expect, test, jest } from '@jest/globals';
import { getTotalRentTimeByContractId } from "../db/db-listing";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ log: ["query"] });

jest.spyOn(console, 'error').mockImplementation(() => {}); 
jest.useFakeTimers();

//========== checkDate ==========

describe('checkDate', () => {
  test('should return true when date is greater than minimalPeriodInSeconds', () => {
    // Initialize date greater than minimalPeriodInSeconds
    const date = 86500;
    // Initialize minimalPeriodInSeconds
    const minimalPeriodInSeconds = 86400;
    // Call the checkDate function
    const result = checkDate(date, minimalPeriodInSeconds);

    // Assert that result should be true
    expect(result).toBe(true);
    // Assert that "console.error" shouldn't been called
    expect(console.error).not.toHaveBeenCalled(); 
  });

  test('should return false when date is less than minimalPeriodInSeconds', () => {
    // Initialize date less than minimalPeriodInSeconds
    const date = 86300;
    // Initialize minimalPeriodInSeconds
    const minimalPeriodInSeconds = 86400;
    // Call the checkDate function
    const result = checkDate(date, minimalPeriodInSeconds);

    // Assert that result should be false
    expect(result).toBe(false);
    // Assert that "console.error" shouldn't been called
    expect(console.error).not.toHaveBeenCalled(); 
  });
  test('should return true when date is equal to minimalPeriodInSeconds', () => {
    // Initialize date equal to minimalPeriodInSeconds
    const date = 86400;
    // Initialize minimalPeriodInSeconds
    const minimalPeriodInSeconds = 86400;
    // Call the checkDate function
    const result = checkDate(date, minimalPeriodInSeconds);

    // Assert that result should be true
    expect(result).toBe(true);
    // Assert that "console.error" shouldn't been called
    expect(console.error).not.toHaveBeenCalled();
  });
  
  test('should return false and error when error occurs during date calculation', () => {
    const originalDateNow = Date.now;
    Date.now = jest.fn(() => {
      throw new Error('Date calculation error');
    });
  
    const date = 86500;
    const minimalPeriodInSeconds = 86400;
    const result = checkDate(date, minimalPeriodInSeconds);
  
    expect(result).toBe(false);
    expect(console.error).toHaveBeenCalled();
  
    Date.now = originalDateNow;
  });
});

//========== delayFunction ==========

describe('delayFunction', () => {
  test('should call the function after the specified expiry time', () => {
    // Create mock
    const func = jest.fn();
    // Set expiry time to 5
    const expiry = 5;

    // Call the delayFunction
    delayFunction(func, expiry);
    // Convert timer to milliseconds
    jest.advanceTimersByTime(expiry * 1000);
    // Assert that the mock function has been called once
    expect(func).toHaveBeenCalledTimes(1);
  });

  test('should call the function with correct delay when rent period is less than MAX_INT32', () => {
    // Create mock
    const func = jest.fn();
    // Set expiry time to 5
    const expiry = 10; 
     // Mock the global setTimeout function
    const setTimeoutMock = jest.spyOn(global, 'setTimeout');
    // Get current time
    const currentTime = Date.now();

    // Call the delayFunction 
    delayFunction(func, expiry);

    // Convert timer to milliseconds
    jest.advanceTimersByTime(expiry * 1000);

    const expectedDelay = expiry * 1000 - (Date.now() - currentTime);

    // Assert that setTimeout has been called once.
    expect(setTimeoutMock).toHaveBeenCalledTimes(1);
    // Assert that setTimeout has been called with mock and number argument.
    expect(setTimeoutMock).toHaveBeenLastCalledWith(func, expect.any(Number));
    setTimeoutMock.mockRestore();
  });
  
  test('should call the function with delay of MAX_INT32 when rent period is greater than MAX_INT32', () => {
    const func = jest.fn();
    //MAX_INT32 =  2147483647
    const expiry = 2247483648; 
    const setTimeoutMock = jest.spyOn(global, 'setTimeout');

    delayFunction(func, expiry);

    // Set the expected delay to MAX_INT32
    const expectedDelay = 0x7FFFFFFF;
    // Get last call to setTimeout
    const lastCall = setTimeoutMock.mock.calls[setTimeoutMock.mock.calls.length - 1];
    if (lastCall !== undefined) {
      // Extract the delay argument from the last call
      const [, delay] = lastCall;
      // Assert that delay is equal to the expected delay
      expect(delay).toBe(expectedDelay);
      // Assert that first argument of the last call is an instance of Function
      expect(lastCall[0]).toBeInstanceOf(Function);
    } else {
      throw new Error('setTimeout was not called');
    }

    jest.advanceTimersByTime(expectedDelay);
  });
});

//========== incrementTotalRentTime ==========

const prismaMock = {
  listing: {
    update: jest.fn(),
  },
};

//@ts-ignore
getTotalRentTimeByContractId = jest.fn().mockImplementation(() => Promise.resolve(5))

describe('incrementTotalRentTime', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should increment totalRentTime correctly', async () => {
    
    const mockPrismaUpdate = jest.spyOn(prisma.listing, 'update');
    const time = 5;
    const nftId = 123;
    
    await incrementTotalRentTime(time, nftId);

    console.log("PRISMA MOCK" ,mockPrismaUpdate.mock.calls);
  });
 
 
  it('should throw error if getTotalRentTimeByContractId fails', async () => {
    
  });
})
 
