export interface ISemaphorePort {
  setDialogState(open: boolean): Promise<boolean>;
}