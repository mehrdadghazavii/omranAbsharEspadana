import { BrowserRouter as Router, Redirect, Route, Switch } from "react-router-dom";
import React from "react";
import {
  CompaniesPage,
  CompanyUsersManagePage,
  ListProjects,
  LoginAndRegisterPage,
  ManageUserProjectPage,
  MessagePage,
  MessagesPage,
  ProjectInfoPage,
} from "../pages";
import { Loader, Rtl } from "../components";
import { connect } from "react-redux";
import { MainLayout } from "../layout/main.layout";
import { createBrowserHistory } from "history";
import { WrapperGA } from "../hoc";
import { ErrorBoundary } from "../hoc/error-boundary";
import { injectStyle } from "react-toastify/dist/inject-style";

// CALL IT ONCE IN YOUR APP
injectStyle();
const history = createBrowserHistory();

function AppRoute(props: { login: boolean }) {
  return (
    <Router history={history}>
      <ErrorBoundary>
        <WrapperGA>
          <Rtl>
            <Switch>
              <Route path="/login" exact>
                <LoginAndRegisterPage />
              </Route>
              {props.login ? (
                <>
                  <MainLayout>
                    <Route path={"/"} exact>
                      <CompaniesPage />
                    </Route>
                    <Route path={"/:companyId/projects"} exact>
                      <ListProjects />
                    </Route>
                    <Route path={"/companyUsers/:companyId"} exact>
                      <CompanyUsersManagePage />
                    </Route>
                    <Route path={"/:companyId/projects/:projectId"} exact>
                      <ProjectInfoPage />
                    </Route>
                    <Route path={"/:companyId/projects/:projectId/report-daily/:date/:currentPage"} exact>
                      <ProjectInfoPage />
                    </Route>
                    <Route path={"/:companyId/projects/:projectId/users"} exact>
                      <ManageUserProjectPage />
                    </Route>
                    <Route path={"/messages/company/:companyId"} exact>
                      <MessagesPage />
                    </Route>
                    <Route path={"/messages/project/:projectId"} exact>
                      <MessagesPage />
                    </Route>
                    <Route path={"/message/:messageId"} exact>
                      <MessagePage />
                    </Route>
                    <Route path={"/404"} exact></Route>
                    <Route path={"/403"} exact></Route>
                  </MainLayout>
                </>
              ) : (
                <Redirect from='*' to="/login" />
              )}
            </Switch>
            <Loader />
          </Rtl>
        </WrapperGA>
      </ErrorBoundary>
    </Router>
  );
}

const mapStateLogin = (state: { user: any }) => {
  return {
    login: !!state.user,
  };
};

const ReduxRoute = connect(mapStateLogin)(AppRoute);

export { ReduxRoute as AppRoute };
