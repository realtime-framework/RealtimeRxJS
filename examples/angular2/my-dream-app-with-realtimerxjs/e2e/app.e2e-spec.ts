import { MyDreamAppWithRealtimerxjsPage } from './app.po';

describe('my-dream-app-with-realtimerxjs App', function() {
  let page: MyDreamAppWithRealtimerxjsPage;

  beforeEach(() => {
    page = new MyDreamAppWithRealtimerxjsPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
