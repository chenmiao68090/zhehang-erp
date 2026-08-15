package com.zhehang.erp.modules.system.util;

import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.io.PrintWriter;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.function.Function;

public final class CsvExportUtils {

    private CsvExportUtils() {
    }

    public static <T> void write(HttpServletResponse response,
                                 String filename,
                                 List<String> headers,
                                 List<T> rows,
                                 List<Function<T, ?>> columns) throws IOException {
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setContentType("text/csv;charset=UTF-8");
        response.setHeader("Content-Disposition", "attachment; filename*=UTF-8''" + encodeFilename(filename));

        try (PrintWriter writer = response.getWriter()) {
            writer.write('\uFEFF');
            writer.println(toCsvLine(headers));
            for (T row : rows) {
                writer.println(toCsvLine(columns.stream().map(column -> column.apply(row)).toList()));
            }
            writer.flush();
        }
    }

    private static String encodeFilename(String filename) {
        return URLEncoder.encode(filename, StandardCharsets.UTF_8).replace("+", "%20");
    }

    private static String toCsvLine(List<?> values) {
        return values.stream()
                .map(CsvExportUtils::escape)
                .reduce((left, right) -> left + "," + right)
                .orElse("");
    }

    private static String escape(Object value) {
        if (value == null) {
            return "";
        }
        String text = String.valueOf(value).replace("\"", "\"\"");
        if (text.contains(",") || text.contains("\n") || text.contains("\r") || text.contains("\"")) {
            return "\"" + text + "\"";
        }
        return text;
    }
}
