const reportsService =
  require(
    "../services/reportsService"
  );

exports.getReports =
  async (req, res) => {

    try {

      const reports =
        await reportsService.getReports();

      res.json(reports);

    } catch (error) {

      console.error(error);

      res.status(500).json({
        message:
          "Failed to load reports",
      });

    }

  };