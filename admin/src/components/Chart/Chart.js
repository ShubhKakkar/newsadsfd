import React, { useState, useEffect } from "react";
import ApexChart from "react-apexcharts";
import moment from "moment";

import useRequest from "../../hooks/useRequest";

const mergeByOp = (a1, a2) =>
  a1.map((itm) => ({
    ...itm,
    ...a2.find((item) => item.option == itm.option && item),
  }));

const staticMonth = [
  { option: "Jan", users: 0 },
  { option: "Feb", users: 0 },
  { option: "Mar", users: 0 },
  { option: "Apr", users: 0 },
  { option: "May", users: 0 },
  { option: "Jun", users: 0 },
  { option: "July", users: 0 },
  { option: "Aug", users: 0 },
  { option: "Sept", users: 0 },
  { option: "Oct", users: 0 },
  { option: "Nov", users: 0 },
  { option: "Dec", users: 0 },
];

const enumerateDaysBetweenDates = () => {
  const startDate = moment().subtract(6, "d");
  const endDate = moment();

  let now = startDate,
    dates = [];

  while (now.isSameOrBefore(endDate)) {
    dates.push(now.format("Do MMM"));
    now.add(1, "days");
  }

  return dates;
};

const staticWeeksHandler = () => {
  const staticWeeks = [
    {
      option: `${moment().startOf("isoWeek").format("DD/MM")} - ${moment()
        .endOf("isoWeek")
        .format("DD/MM")}`,
      users: 0,
    },
  ];

  for (let i = 1; i < 5; i++) {
    staticWeeks.unshift({
      option: `${moment()
        .subtract(i, "weeks")
        .startOf("isoWeek")
        .format("DD/MM")} - ${moment()
        .subtract(i, "weeks")
        .endOf("isoWeek")
        .format("DD/MM")}`,
      users: 0,
    });
  }

  return staticWeeks;
};

const Chart = () => {
  const [options, setOptions] = useState({
    chart: {
      id: "basic-bar",
      toolbar: {
        show: false,
      },
    },
    xaxis: {
      categories: [1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999],
    },
    yaxis: {
      // tickAmount: 3,
      labels: {
        formatter: function (val) {
          return val.toFixed(0);
        },
      },
    },
  });

  const [series, setSeries] = useState([
    {
      name: "New Users",
      data: [30, 40, 45, 50, 49, 60, 70, 91, 95],
    },
  ]);

  const [totalUsers, setTotalUsers] = useState(0);

  const { response, request } = useRequest();

  useEffect(() => {
    byHandler("date");
  }, []);

  useEffect(() => {
    if (response) {
      let graphData = response.user;

      if (response.by == "month") {
        const updatedMonths = mergeByOp(staticMonth, graphData);
        graphData = updatedMonths;
      } else if (response.by == "date") {
        const staticDate = enumerateDaysBetweenDates().map((d) => ({
          option: d,
          users: 0,
        }));
        graphData = graphData.map((d) => {
          const option = moment(d.option, "DD MMM").format("Do MMM");
          return { option, users: d.users };
        });
        const updatedDates = mergeByOp(staticDate, graphData);
        graphData = updatedDates;
      } else if (response.by == "week") {
        const updatedWeeks = mergeByOp(staticWeeksHandler(), graphData);
        graphData = updatedWeeks;
      }

      setTotalUsers(graphData.reduce((a, curr) => a + curr.users, 0));

      setOptions((prev) => ({
        ...prev,
        xaxis: { categories: graphData.map((u) => u.option.toString()) },
      }));

      setSeries([
        {
          name: "Users",
          data: graphData.map((u) => u.users.toString()),
        },
      ]);
    }
  }, [response]);

  const byHandler = (by) => {
    request("GET", `customer/graph?by=${by}`);
  };

  return (
    <div className="row">
      <div className="col-xl-12">
        <div className="card card-custom gutter-b card-stretch gutter-b">
          <div className="card-header h-auto border-0">
            <div className="card-title py-5">
              <h3 className="card-label">
                <span className="d-block text-dark font-weight-bolder">
                  Customers
                </span>
                <span className="d-block text-muted mt-2 font-size-sm">
                  More than {totalUsers}+ Customers
                </span>
              </h3>
            </div>
            <div className="card-toolbar">
              <ul
                className="nav nav-pills nav-pills-sm nav-dark-75"
                role="tablist"
              >
                <li onClick={() => byHandler("month")} className="nav-item">
                  <a
                    className="nav-link py-2 px-4"
                    data-toggle="tab"
                    href="#kt_charts_widget_2_chart_tab_1"
                  >
                    <span className="nav-text font-size-sm">Month</span>
                  </a>
                </li>
                {/* <li onClick={() => byHandler("week")} className="nav-item">
                  <a
                    className="nav-link py-2 px-4"
                    data-toggle="tab"
                    href="#kt_charts_widget_2_chart_tab_2"
                  >
                    <span className="nav-text font-size-sm">Week</span>
                  </a>
                </li> */}
                <li onClick={() => byHandler("date")} className="nav-item">
                  <a
                    className="nav-link py-2 px-4 active"
                    data-toggle="tab"
                    href="#kt_charts_widget_2_chart_tab_3"
                  >
                    <span className="nav-text font-size-sm">Date</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-lg-12">
                {/* <div id="kt_charts_widget_5_chart"></div> */}
                <ApexChart
                  options={options}
                  series={series}
                  type="bar"
                  height={350}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chart;
