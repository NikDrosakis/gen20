const { runAction } = require('../action');
const Maria = require('../core/Maria');

jest.mock('../core/Maria'); // mock database

describe('runAction', async () => {
    it('should fetch action by id, execute it, and return success', async () => {
        const mockActionData = {
            name: 'chatgpt',
            type: 'route',
        };

        Maria.prototype.f = jest.fn(() => Promise.resolve(mockActionData));

        const mockExecuteAction = jest.fn(() => Promise.resolve(true));
        const mockUpdateStatus = jest.fn(() => Promise.resolve());

        const actionModule = require('../action');
        actionModule.executeAction = mockExecuteAction;
        actionModule.updateStatus = mockUpdateStatus;

        const result = await runAction(1);
        expect(result.success).toBe(true);
        expect(Maria.prototype.f).toHaveBeenCalledWith(expect.stringContaining('WHERE action.id=1'));
        expect(mockExecuteAction).toHaveBeenCalledWith(mockActionData, undefined);
        expect(mockUpdateStatus).toHaveBeenCalled();
    });

    it('should return a failure object if the action is not found', async () => {
        Maria.prototype.f = jest.fn(() => Promise.resolve(null));

        const result = await runAction(1);

        expect(result).toBe(false);
        expect(Maria.prototype.f).toHaveBeenCalledWith(expect.stringContaining('WHERE action.id=1'));

    });

    it('should catch any exceptions when running actions', async () => {
        const mockActionData = {
            id: 1,
            type: 'ext_resource',
        };

        Maria.prototype.f = jest.fn(() => Promise.resolve(mockActionData));

        const mockExecuteAction = jest.fn(() => {throw new Error('Test Error')});
        const mockUpdateStatus = jest.fn(() => Promise.resolve());

        const actionModule = require('../action');
        actionModule.executeAction = mockExecuteAction;
        actionModule.updateStatus = mockUpdateStatus;

        const result = await runAction(1);
        expect(result).toBe(undefined);
        expect(mockExecuteAction).toHaveBeenCalledWith(mockActionData, undefined);
        expect(mockUpdateStatus).not.toHaveBeenCalled();
    });
});