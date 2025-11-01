import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import axios from "axios";

admin.initializeApp();

export const getPhishingAnalysis = functions.https.onRequest(
  async (req, res) => {
    try {
      const { url } = req.body as { url: string };

      const response = await axios.post(
        "https://your-python-api-url/api/scan",
        { url }
      );

      const result = response.data.result;
      const explanation: string[] = [];

      if (result.risk_level === "HIGH") {
        explanation.push(
          "The site uses suspicious or misleading domain patterns."
        );
      }

      if (result.ssl_analysis.status === "INVALID") {
        explanation.push(
          "SSL certificate is invalid or self-signed, " +
          "which is often used by fake sites."
        );
      }

      if (result.html_analysis?.has_iframes) {
        explanation.push(
          "Hidden iframes detected — may hide phishing forms or redirects."
        );
      }

      if (result.url_analysis?.contains_ip) {
        explanation.push(
          "Direct IP usage found — often a red flag for phishing sites."
        );
      }

      if (explanation.length === 0) {
        explanation.push(
          "No major issues detected — this website appears legitimate."
        );
      }

      res.status(200).send({
        success: true,
        result: { ...result, explanation },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error";
      res.status(500).send({
        success: false,
        message,
      });
    }
  }
);
