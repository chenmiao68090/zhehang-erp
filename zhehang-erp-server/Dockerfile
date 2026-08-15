# =============================================================
# runtime - 运行本机预编译好的可执行 jar
# =============================================================
FROM eclipse-temurin:17-jre AS runtime

WORKDIR /app

# 设置时区为 Asia/Shanghai
RUN ln -snf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    echo "Asia/Shanghai" > /etc/timezone

ENV TZ=Asia/Shanghai \
    LANG=C.UTF-8 \
    JAVA_OPTS="-Xms256m -Xmx512m -Dfile.encoding=UTF-8 -Duser.timezone=Asia/Shanghai"

# update.sh 会先在本机完成 Maven package,服务器镜像只复制成品 jar。
ARG JAR_FILE=zhehang-erp-admin/target/zhehang-erp-admin-1.0.0-SNAPSHOT.jar
COPY ${JAR_FILE} /app/app.jar

EXPOSE 8080

# 使用 sh -c 形式展开 JAVA_OPTS 环境变量
ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar /app/app.jar"]
